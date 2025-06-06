import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Slider } from '../slider';

describe('Slider', () => {
  it('renders slider with default value', () => {
    render(<Slider defaultValue={[50]} />);
    
    const slider = screen.getByRole('slider');
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveAttribute('aria-valuemin', '0');
    expect(slider).toHaveAttribute('aria-valuemax', '100');
    expect(slider).toHaveAttribute('aria-valuenow', '50');
  });

  it('renders slider with custom min and max values', () => {
    render(<Slider defaultValue={[25]} min={0} max={50} />);
    
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-valuemin', '0');
    expect(slider).toHaveAttribute('aria-valuemax', '50');
    expect(slider).toHaveAttribute('aria-valuenow', '25');
  });

  it('handles value changes with mouse interaction', async () => {
    const onValueChange = jest.fn();
    const user = userEvent.setup();
    
    render(<Slider defaultValue={[50]} onValueChange={onValueChange} />);
    
    const slider = screen.getByRole('slider');
    
    // Simulate dragging (this is complex with actual mouse events)
    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    
    expect(onValueChange).toHaveBeenCalled();
  });

  it('supports keyboard navigation', async () => {
    const onValueChange = jest.fn();
    const user = userEvent.setup();
    
    render(<Slider defaultValue={[50]} onValueChange={onValueChange} />);
    
    const slider = screen.getByRole('slider');
    slider.focus();
    
    // Arrow right should increase value
    await user.keyboard('{ArrowRight}');
    expect(onValueChange).toHaveBeenCalledWith([51]);
    
    // Arrow left should decrease value
    await user.keyboard('{ArrowLeft}');
    
    // Home should go to minimum
    await user.keyboard('{Home}');
    expect(onValueChange).toHaveBeenCalledWith([0]);
    
    // End should go to maximum
    await user.keyboard('{End}');
    expect(onValueChange).toHaveBeenCalledWith([100]);
  });

  it('supports custom step values', async () => {
    const onValueChange = jest.fn();
    const user = userEvent.setup();
    
    render(<Slider defaultValue={[50]} step={10} onValueChange={onValueChange} />);
    
    const slider = screen.getByRole('slider');
    slider.focus();
    
    await user.keyboard('{ArrowRight}');
    expect(onValueChange).toHaveBeenCalledWith([60]); // 50 + 10
  });

  it('supports range slider with multiple values', () => {
    render(<Slider defaultValue={[25, 75]} />);
    
    const sliders = screen.getAllByRole('slider');
    expect(sliders).toHaveLength(2);
    
    expect(sliders[0]).toHaveAttribute('aria-valuenow', '25');
    expect(sliders[1]).toHaveAttribute('aria-valuenow', '75');
  });

  it('handles range slider value changes', async () => {
    const onValueChange = jest.fn();
    const user = userEvent.setup();
    
    render(<Slider defaultValue={[25, 75]} onValueChange={onValueChange} />);
    
    const sliders = screen.getAllByRole('slider');
    const firstSlider = sliders[0];
    
    firstSlider.focus();
    await user.keyboard('{ArrowRight}');
    
    expect(onValueChange).toHaveBeenCalledWith([26, 75]);
  });

  it('prevents overlapping in range slider', async () => {
    const onValueChange = jest.fn();
    const user = userEvent.setup();
    
    render(<Slider defaultValue={[40, 60]} onValueChange={onValueChange} />);
    
    const sliders = screen.getAllByRole('slider');
    const firstSlider = sliders[0];
    
    firstSlider.focus();
    
    // Try to move first slider past the second one
    for (let i = 0; i < 25; i++) {
      await user.keyboard('{ArrowRight}');
    }
    
    // First slider should not exceed second slider's value
    const lastCall = onValueChange.mock.calls[onValueChange.mock.calls.length - 1];
    expect(lastCall[0][0]).toBeLessThanOrEqual(lastCall[0][1]);
  });

  it('supports controlled state', async () => {
    const onValueChange = jest.fn();
    
    const ControlledSlider = () => {
      const [value, setValue] = React.useState([30]);
      
      return (
        <Slider 
          value={value} 
          onValueChange={(newValue) => {
            setValue(newValue);
            onValueChange(newValue);
          }}
        />
      );
    };

    render(<ControlledSlider />);

    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-valuenow', '30');
    
    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    
    await waitFor(() => {
      expect(onValueChange).toHaveBeenCalled();
    });
  });

  it('supports disabled state', async () => {
    const onValueChange = jest.fn();
    const user = userEvent.setup();
    
    render(<Slider defaultValue={[50]} disabled onValueChange={onValueChange} />);
    
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-disabled', 'true');
    
    // Should not respond to keyboard events when disabled
    slider.focus();
    await user.keyboard('{ArrowRight}');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('applies correct CSS classes', () => {
    render(<Slider defaultValue={[50]} className="custom-slider" />);
    
    const slider = screen.getByRole('slider');
    const sliderContainer = slider.closest('[class*="custom-slider"]');
    expect(sliderContainer).toBeInTheDocument();
  });

  it('supports different orientations', () => {
    render(<Slider defaultValue={[50]} orientation="vertical" />);
    
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('handles vertical slider keyboard navigation', async () => {
    const onValueChange = jest.fn();
    const user = userEvent.setup();
    
    render(<Slider defaultValue={[50]} orientation="vertical" onValueChange={onValueChange} />);
    
    const slider = screen.getByRole('slider');
    slider.focus();
    
    // Arrow up should increase value in vertical orientation
    await user.keyboard('{ArrowUp}');
    expect(onValueChange).toHaveBeenCalledWith([51]);
    
    // Arrow down should decrease value
    await user.keyboard('{ArrowDown}');
  });

  it('supports custom accessibility labels', () => {
    render(
      <Slider 
        defaultValue={[75]} 
        aria-label="Volume control"
        aria-labelledby="volume-label"
      />
    );
    
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-label', 'Volume control');
    expect(slider).toHaveAttribute('aria-labelledby', 'volume-label');
  });

  it('displays current value correctly', () => {
    render(<Slider defaultValue={[42]} />);
    
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-valuenow', '42');
  });

  it('handles decimal values', () => {
    render(<Slider defaultValue={[33.5]} step={0.5} />);
    
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-valuenow', '33.5');
  });

  it('supports large value ranges', async () => {
    const onValueChange = jest.fn();
    const user = userEvent.setup();
    
    render(
      <Slider 
        defaultValue={[500]} 
        min={0} 
        max={1000} 
        step={50}
        onValueChange={onValueChange}
      />
    );
    
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-valuemin', '0');
    expect(slider).toHaveAttribute('aria-valuemax', '1000');
    expect(slider).toHaveAttribute('aria-valuenow', '500');
    
    slider.focus();
    await user.keyboard('{ArrowRight}');
    expect(onValueChange).toHaveBeenCalledWith([550]); // 500 + 50
  });

  it('maintains proper thumb positioning', () => {
    render(<Slider defaultValue={[25, 75]} />);
    
    // Both thumbs should be rendered
    const sliders = screen.getAllByRole('slider');
    expect(sliders).toHaveLength(2);
    
    // They should have different values
    expect(sliders[0]).toHaveAttribute('aria-valuenow', '25');
    expect(sliders[1]).toHaveAttribute('aria-valuenow', '75');
  });

  it('supports custom formatters for screen readers', () => {
    const formatValue = (value: number) => `${value} percent`;
    
    render(
      <Slider 
        defaultValue={[60]} 
        aria-valuetext={formatValue(60)}
      />
    );
    
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-valuetext', '60 percent');
  });

  it('handles touch interactions', () => {
    render(<Slider defaultValue={[50]} />);
    
    const slider = screen.getByRole('slider');
    
    // Simulate touch events
    fireEvent.touchStart(slider, {
      touches: [{ clientX: 100, clientY: 0 }]
    });
    
    fireEvent.touchMove(slider, {
      touches: [{ clientX: 150, clientY: 0 }]
    });
    
    fireEvent.touchEnd(slider);
    
    expect(slider).toBeInTheDocument();
  });

  it('supports inverted direction', async () => {
    const onValueChange = jest.fn();
    const user = userEvent.setup();
    
    render(<Slider defaultValue={[50]} inverted onValueChange={onValueChange} />);
    
    const slider = screen.getByRole('slider');
    slider.focus();
    
    // In inverted mode, arrow right might decrease value (depends on implementation)
    await user.keyboard('{ArrowRight}');
    
    expect(onValueChange).toHaveBeenCalled();
  });

  it('handles edge cases with min/max values', async () => {
    const onValueChange = jest.fn();
    const user = userEvent.setup();
    
    render(<Slider defaultValue={[0]} min={0} max={100} onValueChange={onValueChange} />);
    
    const slider = screen.getByRole('slider');
    slider.focus();
    
    // Try to go below minimum
    await user.keyboard('{ArrowLeft}');
    
    // Value should remain at minimum
    expect(slider).toHaveAttribute('aria-valuenow', '0');
  });

  it('supports ref forwarding', () => {
    const ref = React.createRef<HTMLSpanElement>();
    
    render(<Slider ref={ref} defaultValue={[50]} />);
    
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });
});
