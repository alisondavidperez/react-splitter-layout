import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import Pane from './Pane';

function clearSelection() {
  if (document.body.createTextRange) {
    // https://github.com/zesik/react-splitter-layout/issues/16
    // https://stackoverflow.com/questions/22914075/#37580789
    const range = document.body.createTextRange();
    range.collapse();
    range.select();
  } else if (window.getSelection) {
    if (window.getSelection().empty) {
      window.getSelection().empty();
    } else if (window.getSelection().removeAllRanges) {
      window.getSelection().removeAllRanges();
    }
  } else if (document.selection) {
    document.selection.empty();
  }
}

const DEFAULT_SPLITTER_SIZE = 4;

function SplitterLayout({
  customClassName = '',
  vertical = false,
  percentage = false,
  primaryIndex = 0,
  primaryMinSize = 0,
  secondaryInitialSize,
  secondaryMinSize = 0,
  onDragStart,
  onDragEnd,
  onSecondaryPaneSizeChange,
  children = []
}) {
  const [secondaryPaneSize, setSecondaryPaneSize] = useState(0);
  const [resizing, setResizing] = useState(false);
  const containerRef = useRef(null);
  const splitterRef = useRef(null);
  const prevResizingRef = useRef(resizing);
  const prevSecondaryPaneSizeRef = useRef(secondaryPaneSize);
  
  // Normalize primaryIndex to be either 0 or 1
  const normalizedPrimaryIndex = (primaryIndex !== 0 && primaryIndex !== 1) ? 0 : primaryIndex;

  const getSecondaryPaneSize = useCallback((containerRect, splitterRect, clientPosition, offsetMouse) => {
    let totalSize;
    let splitterSize;
    let offset;
    
    if (vertical) {
      totalSize = containerRect.height;
      splitterSize = splitterRect.height;
      offset = clientPosition.top - containerRect.top;
    } else {
      totalSize = containerRect.width;
      splitterSize = splitterRect.width;
      offset = clientPosition.left - containerRect.left;
    }
    
    if (offsetMouse) {
      offset -= splitterSize / 2;
    }
    
    if (offset < 0) {
      offset = 0;
    } else if (offset > totalSize - splitterSize) {
      offset = totalSize - splitterSize;
    }

    let calculatedSecondaryPaneSize;
    if (normalizedPrimaryIndex === 1) {
      calculatedSecondaryPaneSize = offset;
    } else {
      calculatedSecondaryPaneSize = totalSize - splitterSize - offset;
    }
    
    let primaryPaneSize = totalSize - splitterSize - calculatedSecondaryPaneSize;
    
    if (percentage) {
      calculatedSecondaryPaneSize = (calculatedSecondaryPaneSize * 100) / totalSize;
      primaryPaneSize = (primaryPaneSize * 100) / totalSize;
      splitterSize = (splitterSize * 100) / totalSize;
      totalSize = 100;
    }

    if (primaryPaneSize < primaryMinSize) {
      calculatedSecondaryPaneSize = Math.max(calculatedSecondaryPaneSize - (primaryMinSize - primaryPaneSize), 0);
    } else if (calculatedSecondaryPaneSize < secondaryMinSize) {
      calculatedSecondaryPaneSize = Math.min(
        totalSize - splitterSize - primaryMinSize, 
        secondaryMinSize
      );
    }

    return calculatedSecondaryPaneSize;
  }, [vertical, percentage, normalizedPrimaryIndex, primaryMinSize, secondaryMinSize]);

  const handleResize = useCallback(() => {
    if (splitterRef.current && !percentage) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const splitterRect = splitterRef.current.getBoundingClientRect();
      const newSecondaryPaneSize = getSecondaryPaneSize(
        containerRect, 
        splitterRect, 
        {
          left: splitterRect.left,
          top: splitterRect.top
        }, 
        false
      );
      setSecondaryPaneSize(newSecondaryPaneSize);
    }
  }, [getSecondaryPaneSize, percentage]);

  const handleMouseMove = useCallback((e) => {
    if (resizing) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const splitterRect = splitterRef.current.getBoundingClientRect();
      const newSecondaryPaneSize = getSecondaryPaneSize(
        containerRect, 
        splitterRect, 
        {
          left: e.clientX,
          top: e.clientY
        }, 
        true
      );
      clearSelection();
      setSecondaryPaneSize(newSecondaryPaneSize);
    }
  }, [resizing, getSecondaryPaneSize]);

  const handleTouchMove = useCallback((e) => {
    handleMouseMove(e.changedTouches[0]);
  }, [handleMouseMove]);

  const handleSplitterMouseDown = useCallback(() => {
    clearSelection();
    setResizing(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    if (resizing) {
      setResizing(false);
    }
  }, [resizing]);

  // Initialize secondaryPaneSize
  useEffect(() => {
    if (typeof secondaryInitialSize !== 'undefined') {
      setSecondaryPaneSize(secondaryInitialSize);
    } else if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      let splitterRect;
      
      if (splitterRef.current) {
        splitterRect = splitterRef.current.getBoundingClientRect();
      } else {
        // Simulate a splitter
        splitterRect = { width: DEFAULT_SPLITTER_SIZE, height: DEFAULT_SPLITTER_SIZE };
      }
      
      const initialSecondaryPaneSize = getSecondaryPaneSize(
        containerRect, 
        splitterRect, 
        {
          left: containerRect.left + ((containerRect.width - splitterRect.width) / 2),
          top: containerRect.top + ((containerRect.height - splitterRect.height) / 2)
        }, 
        false
      );
      
      setSecondaryPaneSize(initialSecondaryPaneSize);
    }
  }, [secondaryInitialSize, getSecondaryPaneSize]);

  // Add and remove event listeners
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchend', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [handleResize, handleMouseUp, handleMouseMove, handleTouchMove]);

  // Handle callbacks when secondaryPaneSize or resizing state changes
  useEffect(() => {
    if (prevSecondaryPaneSizeRef.current !== secondaryPaneSize && onSecondaryPaneSizeChange) {
      onSecondaryPaneSizeChange(secondaryPaneSize);
    }
    prevSecondaryPaneSizeRef.current = secondaryPaneSize;

    if (prevResizingRef.current !== resizing) {
      if (resizing) {
        onDragStart?.();
      } else {
        onDragEnd?.();
      }
    }
    prevResizingRef.current = resizing;
  }, [secondaryPaneSize, resizing, onDragStart, onDragEnd, onSecondaryPaneSizeChange]);

  // Rendering logic
  let containerClasses = 'splitter-layout';
  if (customClassName) {
    containerClasses += ` ${customClassName}`;
  }
  if (vertical) {
    containerClasses += ' splitter-layout-vertical';
  }
  if (resizing) {
    containerClasses += ' layout-changing';
  }

  const childrenArray = React.Children.toArray(children).slice(0, 2);
  if (childrenArray.length === 0) {
    childrenArray.push(<div />);
  }
  
  const wrappedChildren = [];
  for (let i = 0; i < childrenArray.length; ++i) {
    let primary = true;
    let size = null;
    if (childrenArray.length > 1 && i !== normalizedPrimaryIndex) {
      primary = false;
      size = secondaryPaneSize;
    }
    wrappedChildren.push(
      <Pane 
        key={i}
        vertical={vertical} 
        percentage={percentage} 
        primary={primary} 
        size={size}
      >
        {childrenArray[i]}
      </Pane>
    );
  }

  return (
    <div className={containerClasses} ref={containerRef}>
      {wrappedChildren[0]}
      {wrappedChildren.length > 1 && (
        <div
          role="separator"
          className="layout-splitter"
          ref={splitterRef}
          onMouseDown={handleSplitterMouseDown}
          onTouchStart={handleSplitterMouseDown}
        />
      )}
      {wrappedChildren.length > 1 && wrappedChildren[1]}
    </div>
  );
}

SplitterLayout.propTypes = {
  customClassName: PropTypes.string,
  vertical: PropTypes.bool,
  percentage: PropTypes.bool,
  primaryIndex: PropTypes.number,
  primaryMinSize: PropTypes.number,
  secondaryInitialSize: PropTypes.number,
  secondaryMinSize: PropTypes.number,
  onDragStart: PropTypes.func,
  onDragEnd: PropTypes.func,
  onSecondaryPaneSizeChange: PropTypes.func,
  children: PropTypes.arrayOf(PropTypes.node)
};

export default SplitterLayout;
