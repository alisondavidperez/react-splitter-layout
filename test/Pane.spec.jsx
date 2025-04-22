import React from 'react';
import { render, screen } from '@testing-library/react';
import Pane from '../src/components/Pane';

describe('Pane', () => {
  it('should render a Pane correctly', () => {
    render(<Pane>test pane</Pane>);
    
    const paneElement = screen.getByText('test pane').closest('.layout-pane');
    expect(paneElement).toHaveClass('layout-pane');
    expect(paneElement).toHaveStyle({ width: '0px' });
  });

  it('should render properties of a Pane correctly if requested', () => {
    render(<Pane vertical={true} size={2} percentage={true}>test pane</Pane>);
    
    const paneElement = screen.getByText('test pane').closest('.layout-pane');
    expect(paneElement).toHaveClass('layout-pane');
    expect(paneElement).toHaveStyle({ height: '2%' });
  });

  it('should render a primary Pane correctly if requested', () => {
    render(
      <Pane primary={true} vertical={true} size={2} percentage={true}>
        test pane
      </Pane>
    );
    
    const paneElement = screen.getByText('test pane').closest('.layout-pane');
    expect(paneElement).toHaveClass('layout-pane');
    expect(paneElement).toHaveClass('layout-pane-primary');
    // Primary pane doesn't have size styles
    expect(paneElement).not.toHaveStyle({ height: '2%' });
  });
});
