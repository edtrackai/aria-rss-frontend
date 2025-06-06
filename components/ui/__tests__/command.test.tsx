import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from '../command';

describe('Command', () => {
  it('renders command palette with input and list', () => {
    render(
      <Command>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>Calendar</CommandItem>
            <CommandItem>Search Emoji</CommandItem>
            <CommandItem>Calculator</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    );

    expect(screen.getByPlaceholderText('Type a command or search...')).toBeInTheDocument();
    expect(screen.getByText('Suggestions')).toBeInTheDocument();
    expect(screen.getByText('Calendar')).toBeInTheDocument();
    expect(screen.getByText('Search Emoji')).toBeInTheDocument();
    expect(screen.getByText('Calculator')).toBeInTheDocument();
  });

  it('filters items based on search input', async () => {
    const user = userEvent.setup();
    
    render(
      <Command>
        <CommandInput placeholder="Search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup>
            <CommandItem>Calendar</CommandItem>
            <CommandItem>Calculator</CommandItem>
            <CommandItem>Camera</CommandItem>
            <CommandItem>Settings</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    );

    const input = screen.getByPlaceholderText('Search...');
    await user.type(input, 'cal');
    
    await waitFor(() => {
      expect(screen.getByText('Calendar')).toBeInTheDocument();
      expect(screen.getByText('Calculator')).toBeInTheDocument();
      expect(screen.queryByText('Camera')).not.toBeInTheDocument();
      expect(screen.queryByText('Settings')).not.toBeInTheDocument();
    });
  });

  it('shows empty state when no results found', async () => {
    const user = userEvent.setup();
    
    render(
      <Command>
        <CommandInput placeholder="Search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup>
            <CommandItem>Calendar</CommandItem>
            <CommandItem>Calculator</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    );

    const input = screen.getByPlaceholderText('Search...');
    await user.type(input, 'xyz');
    
    await waitFor(() => {
      expect(screen.getByText('No results found.')).toBeInTheDocument();
      expect(screen.queryByText('Calendar')).not.toBeInTheDocument();
      expect(screen.queryByText('Calculator')).not.toBeInTheDocument();
    });
  });

  it('executes command when item is selected', async () => {
    const onSelect = jest.fn();
    const user = userEvent.setup();
    
    render(
      <Command>
        <CommandInput placeholder="Search..." />
        <CommandList>
          <CommandGroup>
            <CommandItem onSelect={onSelect} value="calendar">
              Calendar
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    );

    const item = screen.getByText('Calendar');
    await user.click(item);
    
    expect(onSelect).toHaveBeenCalledWith('calendar');
  });

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup();
    
    render(
      <Command>
        <CommandInput placeholder="Search..." />
        <CommandList>
          <CommandGroup>
            <CommandItem>Calendar</CommandItem>
            <CommandItem>Calculator</CommandItem>
            <CommandItem>Camera</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    );

    const input = screen.getByPlaceholderText('Search...');
    input.focus();
    
    // Navigate with arrow keys
    await user.keyboard('{ArrowDown}');
    expect(screen.getByText('Calendar')).toHaveAttribute('aria-selected', 'true');
    
    await user.keyboard('{ArrowDown}');
    expect(screen.getByText('Calculator')).toHaveAttribute('aria-selected', 'true');
    
    await user.keyboard('{ArrowUp}');
    expect(screen.getByText('Calendar')).toHaveAttribute('aria-selected', 'true');
  });

  it('selects item with Enter key', async () => {
    const onSelect = jest.fn();
    const user = userEvent.setup();
    
    render(
      <Command>
        <CommandInput placeholder="Search..." />
        <CommandList>
          <CommandGroup>
            <CommandItem onSelect={onSelect} value="calendar">
              Calendar
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    );

    const input = screen.getByPlaceholderText('Search...');
    input.focus();
    
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');
    
    expect(onSelect).toHaveBeenCalledWith('calendar');
  });

  it('renders command dialog', async () => {
    const user = userEvent.setup();
    
    const CommandDialogExample = () => {
      const [open, setOpen] = React.useState(false);
      
      return (
        <>
          <button onClick={() => setOpen(true)}>Open Command</button>
          <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Type a command..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Actions">
                <CommandItem>New File</CommandItem>
                <CommandItem>Open File</CommandItem>
              </CommandGroup>
            </CommandList>
          </CommandDialog>
        </>
      );
    };
    
    render(<CommandDialogExample />);
    
    const openButton = screen.getByText('Open Command');
    await user.click(openButton);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type a command...')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
      expect(screen.getByText('New File')).toBeInTheDocument();
    });
  });

  it('closes command dialog with escape key', async () => {
    const user = userEvent.setup();
    
    const CommandDialogExample = () => {
      const [open, setOpen] = React.useState(true);
      
      return (
        <CommandDialog open={open} onOpenChange={setOpen}>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandGroup>
              <CommandItem>Item 1</CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      );
    };
    
    render(<CommandDialogExample />);
    
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    
    await user.keyboard('{Escape}');
    
    await waitFor(() => {
      expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument();
    });
  });

  it('renders groups with headings and separators', () => {
    render(
      <Command>
        <CommandInput placeholder="Search..." />
        <CommandList>
          <CommandGroup heading="Files">
            <CommandItem>New File</CommandItem>
            <CommandItem>Open File</CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Edit">
            <CommandItem>Copy</CommandItem>
            <CommandItem>Paste</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    );

    expect(screen.getByText('Files')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('New File')).toBeInTheDocument();
    expect(screen.getByText('Copy')).toBeInTheDocument();
  });

  it('renders keyboard shortcuts', () => {
    render(
      <Command>
        <CommandInput placeholder="Search..." />
        <CommandList>
          <CommandGroup>
            <CommandItem>
              New File
              <CommandShortcut>⌘N</CommandShortcut>
            </CommandItem>
            <CommandItem>
              Save File
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    );

    expect(screen.getByText('⌘N')).toBeInTheDocument();
    expect(screen.getByText('⌘S')).toBeInTheDocument();
  });

  it('supports disabled items', async () => {
    const onSelect = jest.fn();
    const user = userEvent.setup();
    
    render(
      <Command>
        <CommandInput placeholder="Search..." />
        <CommandList>
          <CommandGroup>
            <CommandItem onSelect={onSelect}>Available Item</CommandItem>
            <CommandItem disabled onSelect={onSelect}>Disabled Item</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    );

    const disabledItem = screen.getByText('Disabled Item');
    expect(disabledItem).toHaveAttribute('aria-disabled', 'true');
    
    await user.click(disabledItem);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('applies correct CSS classes', () => {
    render(
      <Command className="custom-command">
        <CommandInput className="custom-input" placeholder="Search..." />
        <CommandList className="custom-list">
          <CommandGroup className="custom-group" heading="Test">
            <CommandItem className="custom-item">Item</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    );

    const command = document.querySelector('.custom-command');
    expect(command).toBeInTheDocument();
    
    const input = screen.getByPlaceholderText('Search...');
    expect(input).toHaveClass('custom-input');
    
    const item = screen.getByText('Item');
    expect(item).toHaveClass('custom-item');
  });

  it('supports custom value and filter functions', async () => {
    const user = userEvent.setup();
    
    const customFilter = (value: string, search: string) => {
      return value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
    };
    
    render(
      <Command filter={customFilter}>
        <CommandInput placeholder="Search..." />
        <CommandList>
          <CommandGroup>
            <CommandItem value="apple">Apple</CommandItem>
            <CommandItem value="banana">Banana</CommandItem>
            <CommandItem value="cherry">Cherry</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    );

    const input = screen.getByPlaceholderText('Search...');
    await user.type(input, 'app');
    
    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.queryByText('Banana')).not.toBeInTheDocument();
      expect(screen.queryByText('Cherry')).not.toBeInTheDocument();
    });
  });

  it('maintains focus management', async () => {
    const user = userEvent.setup();
    
    render(
      <Command>
        <CommandInput placeholder="Search..." />
        <CommandList>
          <CommandGroup>
            <CommandItem>Item 1</CommandItem>
            <CommandItem>Item 2</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    );

    const input = screen.getByPlaceholderText('Search...');
    
    // Input should be focusable
    await user.click(input);
    expect(input).toHaveFocus();
    
    // Arrow down should focus first item
    await user.keyboard('{ArrowDown}');
    expect(screen.getByText('Item 1')).toHaveAttribute('aria-selected', 'true');
  });

  it('supports loading state', () => {
    render(
      <Command>
        <CommandInput placeholder="Search..." />
        <CommandList>
          <CommandEmpty>
            <div>Loading...</div>
          </CommandEmpty>
        </CommandList>
      </Command>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('handles rapid typing without performance issues', async () => {
    const user = userEvent.setup();
    const items = Array.from({ length: 100 }, (_, i) => `Item ${i + 1}`);
    
    render(
      <Command>
        <CommandInput placeholder="Search..." />
        <CommandList>
          <CommandEmpty>No results</CommandEmpty>
          <CommandGroup>
            {items.map((item, index) => (
              <CommandItem key={index} value={item.toLowerCase()}>
                {item}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    );

    const input = screen.getByPlaceholderText('Search...');
    
    // Type rapidly
    await user.type(input, 'item 1', { delay: 10 });
    
    await waitFor(() => {
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 10')).toBeInTheDocument();
    });
  });
});
