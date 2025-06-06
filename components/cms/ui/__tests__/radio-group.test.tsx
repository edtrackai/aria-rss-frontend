import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RadioGroup, RadioGroupItem } from '../radio-group';
import { Label } from '../label';

describe('RadioGroup', () => {
  it('renders radio group with items', () => {
    render(
      <RadioGroup defaultValue="option1">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option1" id="option1" />
          <Label htmlFor="option1">Option 1</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option2" id="option2" />
          <Label htmlFor="option2">Option 2</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option3" id="option3" />
          <Label htmlFor="option3">Option 3</Label>
        </div>
      </RadioGroup>
    );

    expect(screen.getByLabelText('Option 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Option 2')).toBeInTheDocument();
    expect(screen.getByLabelText('Option 3')).toBeInTheDocument();
    
    // First option should be selected by default
    expect(screen.getByLabelText('Option 1')).toBeChecked();
  });

  it('changes selection when clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <RadioGroup defaultValue="option1">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option1" id="option1" />
          <Label htmlFor="option1">Option 1</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option2" id="option2" />
          <Label htmlFor="option2">Option 2</Label>
        </div>
      </RadioGroup>
    );

    const option1 = screen.getByLabelText('Option 1');
    const option2 = screen.getByLabelText('Option 2');
    
    expect(option1).toBeChecked();
    expect(option2).not.toBeChecked();
    
    await user.click(option2);
    
    expect(option1).not.toBeChecked();
    expect(option2).toBeChecked();
  });

  it('calls onValueChange when selection changes', async () => {
    const onValueChange = jest.fn();
    const user = userEvent.setup();
    
    render(
      <RadioGroup defaultValue="option1" onValueChange={onValueChange}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option1" id="option1" />
          <Label htmlFor="option1">Option 1</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option2" id="option2" />
          <Label htmlFor="option2">Option 2</Label>
        </div>
      </RadioGroup>
    );

    await user.click(screen.getByLabelText('Option 2'));
    
    expect(onValueChange).toHaveBeenCalledWith('option2');
  });

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup();
    
    render(
      <RadioGroup defaultValue="option1">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option1" id="option1" />
          <Label htmlFor="option1">Option 1</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option2" id="option2" />
          <Label htmlFor="option2">Option 2</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option3" id="option3" />
          <Label htmlFor="option3">Option 3</Label>
        </div>
      </RadioGroup>
    );

    const option1 = screen.getByLabelText('Option 1');
    const option2 = screen.getByLabelText('Option 2');
    const option3 = screen.getByLabelText('Option 3');
    
    option1.focus();
    
    // Arrow down should move to next option
    await user.keyboard('{ArrowDown}');
    expect(option2).toHaveFocus();
    expect(option2).toBeChecked();
    
    // Arrow down again
    await user.keyboard('{ArrowDown}');
    expect(option3).toHaveFocus();
    expect(option3).toBeChecked();
    
    // Arrow up should move to previous option
    await user.keyboard('{ArrowUp}');
    expect(option2).toHaveFocus();
    expect(option2).toBeChecked();
  });

  it('supports controlled state', async () => {
    const onValueChange = jest.fn();
    
    const ControlledRadioGroup = () => {
      const [value, setValue] = React.useState('option1');
      
      return (
        <RadioGroup value={value} onValueChange={(newValue) => {
          setValue(newValue);
          onValueChange(newValue);
        }}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="option1" id="controlled-option1" />
            <Label htmlFor="controlled-option1">Controlled Option 1</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="option2" id="controlled-option2" />
            <Label htmlFor="controlled-option2">Controlled Option 2</Label>
          </div>
        </RadioGroup>
      );
    };

    render(<ControlledRadioGroup />);

    expect(screen.getByLabelText('Controlled Option 1')).toBeChecked();
    
    await userEvent.click(screen.getByLabelText('Controlled Option 2'));
    expect(onValueChange).toHaveBeenCalledWith('option2');
    
    await waitFor(() => {
      expect(screen.getByLabelText('Controlled Option 2')).toBeChecked();
    });
  });

  it('supports disabled state for entire group', () => {
    render(
      <RadioGroup defaultValue="option1" disabled>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option1" id="disabled-option1" />
          <Label htmlFor="disabled-option1">Option 1</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option2" id="disabled-option2" />
          <Label htmlFor="disabled-option2">Option 2</Label>
        </div>
      </RadioGroup>
    );

    expect(screen.getByLabelText('Option 1')).toBeDisabled();
    expect(screen.getByLabelText('Option 2')).toBeDisabled();
  });

  it('supports disabled state for individual items', async () => {
    const onValueChange = jest.fn();
    const user = userEvent.setup();
    
    render(
      <RadioGroup defaultValue="option1" onValueChange={onValueChange}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option1" id="individual-option1" />
          <Label htmlFor="individual-option1">Option 1</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option2" id="individual-option2" disabled />
          <Label htmlFor="individual-option2">Option 2 (disabled)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option3" id="individual-option3" />
          <Label htmlFor="individual-option3">Option 3</Label>
        </div>
      </RadioGroup>
    );

    const disabledOption = screen.getByLabelText('Option 2 (disabled)');
    expect(disabledOption).toBeDisabled();
    
    await user.click(disabledOption);
    expect(onValueChange).not.toHaveBeenCalledWith('option2');
    
    // Clicking enabled option should work
    await user.click(screen.getByLabelText('Option 3'));
    expect(onValueChange).toHaveBeenCalledWith('option3');
  });

  it('applies correct CSS classes', () => {
    render(
      <RadioGroup defaultValue="option1" className="custom-radio-group">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option1" id="styled-option1" className="custom-radio-item" />
          <Label htmlFor="styled-option1">Option 1</Label>
        </div>
      </RadioGroup>
    );

    const radioGroup = screen.getByRole('radiogroup');
    expect(radioGroup).toHaveClass('custom-radio-group');
    
    const radioItem = screen.getByLabelText('Option 1');
    expect(radioItem).toHaveClass('custom-radio-item');
  });

  it('supports different orientations', async () => {
    const user = userEvent.setup();
    
    render(
      <RadioGroup defaultValue="option1" orientation="horizontal">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option1" id="horizontal-option1" />
          <Label htmlFor="horizontal-option1">Option 1</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option2" id="horizontal-option2" />
          <Label htmlFor="horizontal-option2">Option 2</Label>
        </div>
      </RadioGroup>
    );

    const radioGroup = screen.getByRole('radiogroup');
    expect(radioGroup).toHaveAttribute('aria-orientation', 'horizontal');
    
    const option1 = screen.getByLabelText('Option 1');
    option1.focus();
    
    // In horizontal orientation, arrow right should move to next
    await user.keyboard('{ArrowRight}');
    expect(screen.getByLabelText('Option 2')).toHaveFocus();
  });

  it('handles space key selection', async () => {
    const onValueChange = jest.fn();
    const user = userEvent.setup();
    
    render(
      <RadioGroup defaultValue="option1" onValueChange={onValueChange}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option1" id="space-option1" />
          <Label htmlFor="space-option1">Option 1</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option2" id="space-option2" />
          <Label htmlFor="space-option2">Option 2</Label>
        </div>
      </RadioGroup>
    );

    const option2 = screen.getByLabelText('Option 2');
    option2.focus();
    
    await user.keyboard(' ');
    expect(onValueChange).toHaveBeenCalledWith('option2');
  });

  it('maintains proper ARIA attributes', () => {
    render(
      <RadioGroup defaultValue="option1" aria-label="Choose an option">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option1" id="aria-option1" />
          <Label htmlFor="aria-option1">Option 1</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option2" id="aria-option2" />
          <Label htmlFor="aria-option2">Option 2</Label>
        </div>
      </RadioGroup>
    );

    const radioGroup = screen.getByRole('radiogroup');
    expect(radioGroup).toHaveAttribute('aria-label', 'Choose an option');
    
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(2);
    
    radios.forEach(radio => {
      expect(radio).toHaveAttribute('type', 'radio');
    });
  });

  it('supports form integration', () => {
    render(
      <form>
        <RadioGroup defaultValue="option1" name="test-radio">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="option1" id="form-option1" />
            <Label htmlFor="form-option1">Option 1</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="option2" id="form-option2" />
            <Label htmlFor="form-option2">Option 2</Label>
          </div>
        </RadioGroup>
      </form>
    );

    const radios = screen.getAllByRole('radio');
    radios.forEach(radio => {
      expect(radio).toHaveAttribute('name', 'test-radio');
    });
  });

  it('supports required validation', () => {
    render(
      <RadioGroup required aria-label="Required selection">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option1" id="required-option1" />
          <Label htmlFor="required-option1">Option 1</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option2" id="required-option2" />
          <Label htmlFor="required-option2">Option 2</Label>
        </div>
      </RadioGroup>
    );

    const radios = screen.getAllByRole('radio');
    radios.forEach(radio => {
      expect(radio).toHaveAttribute('required');
    });
  });

  it('handles complex layouts with descriptions', () => {
    render(
      <RadioGroup defaultValue="plan1">
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <RadioGroupItem value="plan1" id="plan1" className="mt-1" />
            <div>
              <Label htmlFor="plan1" className="font-medium">Basic Plan</Label>
              <p className="text-sm text-gray-500">Perfect for individuals</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <RadioGroupItem value="plan2" id="plan2" className="mt-1" />
            <div>
              <Label htmlFor="plan2" className="font-medium">Pro Plan</Label>
              <p className="text-sm text-gray-500">Great for teams</p>
            </div>
          </div>
        </div>
      </RadioGroup>
    );

    expect(screen.getByLabelText('Basic Plan')).toBeInTheDocument();
    expect(screen.getByLabelText('Pro Plan')).toBeInTheDocument();
    expect(screen.getByText('Perfect for individuals')).toBeInTheDocument();
    expect(screen.getByText('Great for teams')).toBeInTheDocument();
  });

  it('supports ref forwarding', () => {
    const ref = React.createRef<HTMLDivElement>();
    
    render(
      <RadioGroup ref={ref} defaultValue="option1">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option1" id="ref-option1" />
          <Label htmlFor="ref-option1">Option 1</Label>
        </div>
      </RadioGroup>
    );

    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current).toBe(screen.getByRole('radiogroup'));
  });
});
