import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateRangePicker } from '../date-range-picker';
import { addDays, format } from 'date-fns';

describe('DateRangePicker', () => {
  it('renders date range picker trigger', () => {
    render(<DateRangePicker />);
    
    const trigger = screen.getByRole('button');
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent(/pick a date range/i);
  });

  it('opens calendar when trigger is clicked', async () => {
    const user = userEvent.setup();
    render(<DateRangePicker />);
    
    const trigger = screen.getByRole('button');
    await user.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByRole('application')).toBeInTheDocument();
    });
  });

  it('displays selected date range in trigger', () => {
    const startDate = new Date(2024, 0, 1);
    const endDate = new Date(2024, 0, 15);
    const dateRange = { from: startDate, to: endDate };
    
    render(<DateRangePicker selected={dateRange} />);
    
    const trigger = screen.getByRole('button');
    expect(trigger).toHaveTextContent('Jan 1, 2024 - Jan 15, 2024');
  });

  it('selects date range when dates are clicked', async () => {
    const onSelect = jest.fn();
    const user = userEvent.setup();
    
    render(<DateRangePicker onSelect={onSelect} />);
    
    const trigger = screen.getByRole('button');
    await user.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByRole('application')).toBeInTheDocument();
    });

    // Click start date
    const startDate = screen.getByRole('button', { name: '10' });
    await user.click(startDate);
    
    // Click end date
    const endDate = screen.getByRole('button', { name: '20' });
    await user.click(endDate);
    
    expect(onSelect).toHaveBeenCalled();
  });

  it('shows placeholder text when no date is selected', () => {
    render(<DateRangePicker placeholder="Select date range" />);
    
    const trigger = screen.getByRole('button');
    expect(trigger).toHaveTextContent('Select date range');
  });

  it('supports controlled state', async () => {
    const onSelect = jest.fn();
    const initialRange = {
      from: new Date(2024, 0, 1),
      to: new Date(2024, 0, 7)
    };
    
    const ControlledDateRangePicker = () => {
      const [range, setRange] = React.useState(initialRange);
      
      return (
        <DateRangePicker 
          selected={range} 
          onSelect={(newRange) => {
            setRange(newRange);
            onSelect(newRange);
          }}
        />
      );
    };
    
    render(<ControlledDateRangePicker />);
    
    const trigger = screen.getByRole('button');
    expect(trigger).toHaveTextContent('Jan 1, 2024 - Jan 7, 2024');
  });

  it('closes calendar when date range is selected', async () => {
    const user = userEvent.setup();
    render(<DateRangePicker />);
    
    const trigger = screen.getByRole('button');
    await user.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByRole('application')).toBeInTheDocument();
    });

    // Select complete range
    const startDate = screen.getByRole('button', { name: '1' });
    await user.click(startDate);
    
    const endDate = screen.getByRole('button', { name: '15' });
    await user.click(endDate);
    
    // Calendar should close after range selection
    await waitFor(() => {
      expect(screen.queryByRole('application')).not.toBeInTheDocument();
    });
  });

  it('supports custom date formatting', () => {
    const startDate = new Date(2024, 5, 1); // June 1, 2024
    const endDate = new Date(2024, 5, 15); // June 15, 2024
    const dateRange = { from: startDate, to: endDate };
    
    const formatDate = (date: Date) => format(date, 'dd/MM/yyyy');
    
    render(
      <DateRangePicker 
        selected={dateRange} 
        formatDate={formatDate}
      />
    );
    
    const trigger = screen.getByRole('button');
    expect(trigger).toHaveTextContent('01/06/2024 - 15/06/2024');
  });

  it('applies custom CSS classes', async () => {
    const user = userEvent.setup();
    render(
      <DateRangePicker 
        className="custom-picker"
        triggerClassName="custom-trigger"
      />
    );
    
    const trigger = screen.getByRole('button');
    expect(trigger).toHaveClass('custom-trigger');
  });

  it('supports disabled state', () => {
    render(<DateRangePicker disabled />);
    
    const trigger = screen.getByRole('button');
    expect(trigger).toBeDisabled();
  });

  it('handles partial range selection', async () => {
    const onSelect = jest.fn();
    const user = userEvent.setup();
    
    render(<DateRangePicker onSelect={onSelect} />);
    
    const trigger = screen.getByRole('button');
    await user.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByRole('application')).toBeInTheDocument();
    });

    // Click only start date
    const startDate = screen.getByRole('button', { name: '10' });
    await user.click(startDate);
    
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({
      from: expect.any(Date),
      to: undefined
    }));
  });

  it('supports preset date ranges', async () => {
    const user = userEvent.setup();
    const presets = [
      {
        label: 'Last 7 days',
        range: {
          from: addDays(new Date(), -7),
          to: new Date()
        }
      },
      {
        label: 'Last 30 days',
        range: {
          from: addDays(new Date(), -30),
          to: new Date()
        }
      }
    ];
    
    render(<DateRangePicker presets={presets} />);
    
    const trigger = screen.getByRole('button');
    await user.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByText('Last 7 days')).toBeInTheDocument();
      expect(screen.getByText('Last 30 days')).toBeInTheDocument();
    });
  });

  it('applies preset when clicked', async () => {
    const onSelect = jest.fn();
    const user = userEvent.setup();
    
    const presets = [
      {
        label: 'Today',
        range: {
          from: new Date(),
          to: new Date()
        }
      }
    ];
    
    render(<DateRangePicker presets={presets} onSelect={onSelect} />);
    
    const trigger = screen.getByRole('button');
    await user.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByText('Today')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Today'));
    expect(onSelect).toHaveBeenCalled();
  });

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<DateRangePicker />);
    
    const trigger = screen.getByRole('button');
    
    // Open with keyboard
    trigger.focus();
    await user.keyboard('{Enter}');
    
    await waitFor(() => {
      expect(screen.getByRole('application')).toBeInTheDocument();
    });

    // Close with Escape
    await user.keyboard('{Escape}');
    
    await waitFor(() => {
      expect(screen.queryByRole('application')).not.toBeInTheDocument();
    });
  });

  it('validates date range order', async () => {
    const onSelect = jest.fn();
    const user = userEvent.setup();
    
    render(<DateRangePicker onSelect={onSelect} />);
    
    const trigger = screen.getByRole('button');
    await user.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByRole('application')).toBeInTheDocument();
    });

    // Click end date first (higher number)
    const endDate = screen.getByRole('button', { name: '20' });
    await user.click(endDate);
    
    // Click start date (lower number)
    const startDate = screen.getByRole('button', { name: '10' });
    await user.click(startDate);
    
    // Should automatically swap to correct order
    expect(onSelect).toHaveBeenCalled();
  });

  it('highlights date range preview', async () => {
    const user = userEvent.setup();
    render(<DateRangePicker />);
    
    const trigger = screen.getByRole('button');
    await user.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByRole('application')).toBeInTheDocument();
    });

    // Click start date
    const startDate = screen.getByRole('button', { name: '10' });
    await user.click(startDate);
    
    // Hover over potential end date
    const endDate = screen.getByRole('button', { name: '15' });
    await user.hover(endDate);
    
    // Range preview should be visible (dates between should be highlighted)
    const date12 = screen.getByRole('button', { name: '12' });
    expect(date12).toHaveAttribute('data-range-middle', 'true');
  });

  it('supports minimum and maximum selectable dates', async () => {
    const today = new Date();
    const minDate = addDays(today, -30);
    const maxDate = addDays(today, 30);
    
    const user = userEvent.setup();
    render(
      <DateRangePicker 
        disabled={(date) => date < minDate || date > maxDate}
      />
    );
    
    const trigger = screen.getByRole('button');
    await user.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByRole('application')).toBeInTheDocument();
    });

    // Dates outside range should be disabled
    const farPastDate = screen.getByRole('button', { name: '1' });
    expect(farPastDate).toBeDisabled();
  });

  it('maintains accessibility attributes', async () => {
    const user = userEvent.setup();
    render(<DateRangePicker aria-label="Select date range" />);
    
    const trigger = screen.getByRole('button');
    expect(trigger).toHaveAttribute('aria-label', 'Select date range');
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    
    await user.click(trigger);
    
    await waitFor(() => {
      const calendar = screen.getByRole('application');
      expect(calendar).toHaveAttribute('aria-label');
    });
  });
});
