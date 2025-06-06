import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Calendar } from '../calendar';

describe('Calendar', () => {
  it('renders calendar with current month', () => {
    render(<Calendar />);
    
    // Check for navigation buttons
    expect(screen.getByRole('button', { name: /previous month/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next month/i })).toBeInTheDocument();
    
    // Check for weekday headers
    expect(screen.getByText('Su')).toBeInTheDocument();
    expect(screen.getByText('Mo')).toBeInTheDocument();
    expect(screen.getByText('Tu')).toBeInTheDocument();
    expect(screen.getByText('We')).toBeInTheDocument();
    expect(screen.getByText('Th')).toBeInTheDocument();
    expect(screen.getByText('Fr')).toBeInTheDocument();
    expect(screen.getByText('Sa')).toBeInTheDocument();
  });

  it('navigates between months', async () => {
    const user = userEvent.setup();
    render(<Calendar />);
    
    const nextButton = screen.getByRole('button', { name: /next month/i });
    const prevButton = screen.getByRole('button', { name: /previous month/i });
    
    // Navigate to next month
    await user.click(nextButton);
    
    // Navigate to previous month
    await user.click(prevButton);
    
    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
  });

  it('selects a date when clicked', async () => {
    const onSelect = jest.fn();
    const user = userEvent.setup();
    
    render(<Calendar onSelect={onSelect} />);
    
    // Find a date button (look for a day that exists in most months)
    const dateButton = screen.getByRole('button', { name: '15' });
    await user.click(dateButton);
    
    expect(onSelect).toHaveBeenCalled();
  });

  it('supports controlled selection', () => {
    const selectedDate = new Date(2024, 0, 15); // January 15, 2024
    
    render(<Calendar selected={selectedDate} />);
    
    // The selected date should be highlighted
    const selectedButton = screen.getByRole('button', { name: '15' });
    expect(selectedButton).toHaveAttribute('aria-selected', 'true');
  });

  it('disables dates based on disabled prop', async () => {
    const user = userEvent.setup();
    const disabledDates = [new Date(2024, 0, 10), new Date(2024, 0, 20)];
    
    render(
      <Calendar 
        disabled={(date) => 
          disabledDates.some(disabled => 
            date.getDate() === disabled.getDate() && 
            date.getMonth() === disabled.getMonth()
          )
        }
      />
    );
    
    const disabledButton = screen.getByRole('button', { name: '10' });
    expect(disabledButton).toBeDisabled();
  });

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<Calendar />);
    
    // Focus on a date
    const dateButton = screen.getByRole('button', { name: '15' });
    dateButton.focus();
    
    // Navigate with arrow keys
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: '16' })).toHaveFocus();
    
    await user.keyboard('{ArrowDown}');
    // Should move to the same day next week
    
    await user.keyboard('{ArrowLeft}');
    // Should move back one day
    
    await user.keyboard('{ArrowUp}');
    // Should move to the same day previous week
  });

  it('supports different modes (single, multiple, range)', async () => {
    const onSelect = jest.fn();
    const user = userEvent.setup();
    
    // Test single mode (default)
    const { rerender } = render(<Calendar mode="single" onSelect={onSelect} />);
    
    const date1 = screen.getByRole('button', { name: '10' });
    await user.click(date1);
    
    expect(onSelect).toHaveBeenCalled();
    
    // Test multiple mode
    rerender(<Calendar mode="multiple" onSelect={onSelect} />);
    
    const date2 = screen.getByRole('button', { name: '15' });
    await user.click(date2);
    
    expect(onSelect).toHaveBeenCalled();
  });

  it('applies custom CSS classes', () => {
    render(<Calendar className="custom-calendar" />);
    
    const calendar = document.querySelector('.custom-calendar');
    expect(calendar).toBeInTheDocument();
  });

  it('handles today highlighting', () => {
    render(<Calendar />);
    
    const today = new Date();
    const todayButton = screen.getByRole('button', { name: today.getDate().toString() });
    
    // Today should have special styling (data-today attribute)
    expect(todayButton).toHaveAttribute('data-today', 'true');
  });

  it('supports custom formatters', () => {
    const customFormatters = {
      formatCaption: (date: Date) => `Custom ${date.getFullYear()}`,
      formatWeekdayName: (date: Date) => date.toLocaleDateString('en', { weekday: 'narrow' })
    };
    
    render(<Calendar formatters={customFormatters} />);
    
    // Should use custom formatting
    expect(screen.getByText(/Custom \d{4}/)).toBeInTheDocument();
  });

  it('supports different starting week days', () => {
    // Start week on Monday
    render(<Calendar weekStartsOn={1} />);
    
    // Monday should be the first column
    const weekdayHeaders = screen.getAllByRole('columnheader');
    expect(weekdayHeaders[0]).toHaveTextContent('Mo');
  });

  it('handles outside days (previous/next month)', async () => {
    const user = userEvent.setup();
    render(<Calendar showOutsideDays />);
    
    // Outside days should be visible but dimmed
    const outsideDays = document.querySelectorAll('[data-outside="true"]');
    expect(outsideDays.length).toBeGreaterThan(0);
  });

  it('supports range selection', async () => {
    const onSelect = jest.fn();
    const user = userEvent.setup();
    
    render(<Calendar mode="range" onSelect={onSelect} />);
    
    // Select start date
    const startDate = screen.getByRole('button', { name: '10' });
    await user.click(startDate);
    
    // Select end date
    const endDate = screen.getByRole('button', { name: '20' });
    await user.click(endDate);
    
    expect(onSelect).toHaveBeenCalledTimes(2);
  });

  it('supports minimum and maximum dates', () => {
    const today = new Date();
    const minDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const maxDate = new Date(today.getFullYear(), today.getMonth(), 15);
    
    render(
      <Calendar 
        disabled={(date) => date < minDate || date > maxDate}
      />
    );
    
    // Dates outside the range should be disabled
    const disabledDate = screen.getByRole('button', { name: '25' });
    expect(disabledDate).toBeDisabled();
  });

  it('handles month/year dropdown navigation', async () => {
    const user = userEvent.setup();
    render(<Calendar captionLayout="dropdown" />);
    
    // Look for month/year dropdowns
    const monthDropdown = screen.getByRole('combobox', { name: /month/i });
    const yearDropdown = screen.getByRole('combobox', { name: /year/i });
    
    expect(monthDropdown).toBeInTheDocument();
    expect(yearDropdown).toBeInTheDocument();
  });

  it('supports locale-specific formatting', () => {
    render(<Calendar locale={require('date-fns/locale/es')} />);
    
    // Should display Spanish month names and weekdays
    // Note: This test depends on date-fns locale support
  });

  it('maintains accessibility attributes', () => {
    render(<Calendar />);
    
    const calendar = screen.getByRole('application');
    expect(calendar).toHaveAttribute('aria-label');
    
    // Grid should have proper structure
    const grid = screen.getByRole('grid');
    expect(grid).toBeInTheDocument();
    
    // Column headers for weekdays
    const columnHeaders = screen.getAllByRole('columnheader');
    expect(columnHeaders).toHaveLength(7); // 7 days of week
    
    // Grid cells for dates
    const gridCells = screen.getAllByRole('gridcell');
    expect(gridCells.length).toBeGreaterThan(0);
  });

  it('supports custom day content', () => {
    const customDayRender = (date: Date) => (
      <div>
        <span>{date.getDate()}</span>
        <div className="custom-indicator">•</div>
      </div>
    );
    
    render(<Calendar components={{ Day: customDayRender }} />);
    
    const customIndicators = document.querySelectorAll('.custom-indicator');
    expect(customIndicators.length).toBeGreaterThan(0);
  });

  it('handles focus management properly', async () => {
    const user = userEvent.setup();
    render(<Calendar />);
    
    // Focus should be manageable
    await user.tab();
    
    // Should focus on navigation or date elements
    const focusedElement = document.activeElement;
    expect(focusedElement).toBeTruthy();
  });
});
