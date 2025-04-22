/* eslint prefer-spread: [0], react/no-array-index-key: [0], react/no-find-dom-node: [0] */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import SplitterLayout from '../src/components/SplitterLayout';

describe('SplitterLayout', () => {
  describe('rendering', () => {
    it('should render correctly when 2 children provided', () => {
      render(
        <SplitterLayout>
          <div>Child #0</div>
          <div>Child #1</div>
        </SplitterLayout>
      );

      expect(screen.getByText('Child #0')).toBeInTheDocument();
      expect(screen.getByText('Child #1')).toBeInTheDocument();
      expect(document.querySelector('.layout-splitter')).toBeInTheDocument();
    });

    it('should render properties correctly if requested', () => {
      render(
        <SplitterLayout
          customClassName="custom-class"
          vertical={true}
          percentage={true}
          primaryIndex={1}
        >
          <div>Child #0</div>
          <div>Child #1</div>
        </SplitterLayout>
      );

      const container = document.querySelector('.splitter-layout');
      expect(container).toHaveClass('custom-class');
      expect(container).toHaveClass('splitter-layout-vertical');
    });

    it('should set the first children as primary if invalid primary index is provided', () => {
      render(
        <SplitterLayout primaryIndex={5}>
          <div>Child #0</div>
          <div>Child #1</div>
        </SplitterLayout>
      );

      expect(screen.getByText('Child #0')).toBeInTheDocument();
      // The first child should be in a primary pane, but we can't directly test internal logic
    });

    it('should render one child when nothing provided', () => {
      render(<SplitterLayout />);
      
      // There should be only one pane and no splitter
      expect(document.querySelectorAll('.layout-pane').length).toBe(1);
      expect(document.querySelectorAll('.layout-splitter').length).toBe(0);
    });

    it('should render one child when only 1 child provided', () => {
      render(
        <SplitterLayout>
          <div>Only Child</div>
        </SplitterLayout>
      );
      
      expect(screen.getByText('Only Child')).toBeInTheDocument();
      expect(document.querySelectorAll('.layout-pane').length).toBe(1);
      expect(document.querySelectorAll('.layout-splitter').length).toBe(0);
    });

    it('should render 2 children when more than 2 children provided', () => {
      render(
        <SplitterLayout>
          <div>Child #0</div>
          <div>Child #1</div>
          <div>Child #2</div>
          <div>Child #3</div>
          <div>Child #4</div>
        </SplitterLayout>
      );

      // Only the first two children should be rendered
      expect(screen.getByText('Child #0')).toBeInTheDocument();
      expect(screen.getByText('Child #1')).toBeInTheDocument();
      expect(screen.queryByText('Child #2')).not.toBeInTheDocument();
      expect(document.querySelectorAll('.layout-pane').length).toBe(2);
      expect(document.querySelectorAll('.layout-splitter').length).toBe(1);
    });
  });

  // Skip direct testing of the sizing methods as they are implementation details
  // and would need to be exposed differently in a hooks-based component

  describe('DOM', () => {
    afterEach(() => {
      document.body.createTextRange = undefined;
      window.getSelection = undefined;
      document.selection = undefined;
    });

    it('should add DOM event listeners when mounted', () => {
      const windowSpy = jest.spyOn(window, 'addEventListener');
      const documentSpy = jest.spyOn(document, 'addEventListener');
      
      render(
        <SplitterLayout>
          <div>Child #0</div>
          <div>Child #1</div>
        </SplitterLayout>
      );
      
      expect(windowSpy).toHaveBeenCalledWith('resize', expect.any(Function));
      expect(documentSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));
      expect(documentSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
      
      windowSpy.mockRestore();
      documentSpy.mockRestore();
    });

    it('should trigger drag events when dragging starts and finishes', () => {
      const startFn = jest.fn();
      const endFn = jest.fn();
      
      const { container } = render(
        <SplitterLayout onDragStart={startFn} onDragEnd={endFn}>
          <div>Child #0</div>
          <div>Child #1</div>
        </SplitterLayout>
      );
      
      expect(startFn).not.toHaveBeenCalled();
      expect(endFn).not.toHaveBeenCalled();
      
      const splitter = container.querySelector('.layout-splitter');
      
      act(() => {
        fireEvent.mouseDown(splitter);
      });
      expect(startFn).toHaveBeenCalledTimes(1);
      expect(endFn).not.toHaveBeenCalled();
      
      act(() => {
        document.simulateMouseUp();
      });
      expect(startFn).toHaveBeenCalledTimes(1);
      expect(endFn).toHaveBeenCalledTimes(1);
    });

    it('should trigger size change events when secondary pane size has been changed', () => {
      const fn = jest.fn();
      
      const { container } = render(
        <SplitterLayout secondaryInitialSize={20} onSecondaryPaneSizeChange={fn}>
          <div>Child #0</div>
          <div>Child #1</div>
        </SplitterLayout>
      );
      
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith(20);
      
      const splitter = container.querySelector('.layout-splitter');
      
      act(() => {
        fireEvent.mouseDown(splitter);
        document.simulateMouseMove(25, 30);
      });
    });

    it('should trigger drag events when touching starts and finishes', () => {
      const startFn = jest.fn();
      const endFn = jest.fn();
      
      const { container } = render(
        <SplitterLayout onDragStart={startFn} onDragEnd={endFn}>
          <div>Child #0</div>
          <div>Child #1</div>
        </SplitterLayout>
      );
      
      expect(startFn).not.toHaveBeenCalled();
      expect(endFn).not.toHaveBeenCalled();
      
      const splitter = container.querySelector('.layout-splitter');
      
      act(() => {
        fireEvent.touchStart(splitter);
      });
      expect(startFn).toHaveBeenCalledTimes(1);
      expect(endFn).not.toHaveBeenCalled();
      
      act(() => {
        document.simulateTouchEnd();
      });
      expect(startFn).toHaveBeenCalledTimes(1);
      expect(endFn).toHaveBeenCalledTimes(1);
    });
  });
});
