import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from '../dropdown-menu';

describe('DropdownMenu', () => {
  it('renders trigger and opens menu on click', async () => {
    const user = userEvent.setup();
    
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuItem>Item 2</DropdownMenuItem>
          <DropdownMenuItem>Item 3</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const trigger = screen.getByText('Open Menu');
    expect(trigger).toBeInTheDocument();

    await user.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByText('Item 1')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });

  it('executes item click handler', async () => {
    const onItemClick = jest.fn();
    const user = userEvent.setup();
    
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={onItemClick}>Clickable Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    await user.click(screen.getByText('Open Menu'));
    
    await waitFor(() => {
      expect(screen.getByText('Clickable Item')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Clickable Item'));
    expect(onItemClick).toHaveBeenCalled();
  });

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup();
    
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuItem>Item 2</DropdownMenuItem>
          <DropdownMenuItem>Item 3</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const trigger = screen.getByText('Open Menu');
    trigger.focus();
    
    // Open with Enter key
    await user.keyboard('{Enter}');
    
    await waitFor(() => {
      expect(screen.getByText('Item 1')).toBeInTheDocument();
    });

    // Navigate with arrow keys
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    
    // Should be on Item 3 now
    await user.keyboard('{Enter}');
  });

  it('renders checkbox items with state', async () => {
    const user = userEvent.setup();
    const [checked, setChecked] = [true, jest.fn()];
    
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Options</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem 
            checked={checked} 
            onCheckedChange={setChecked}
          >
            Checkbox Option
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    await user.click(screen.getByText('Options'));
    
    await waitFor(() => {
      const checkboxItem = screen.getByText('Checkbox Option');
      expect(checkboxItem).toBeInTheDocument();
    });
  });

  it('renders radio items with groups', async () => {
    const user = userEvent.setup();
    const [value, setValue] = ['option1', jest.fn()];
    
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Radio Options</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup value={value} onValueChange={setValue}>
            <DropdownMenuRadioItem value="option1">Option 1</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="option2">Option 2</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="option3">Option 3</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    await user.click(screen.getByText('Radio Options'));
    
    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.getByText('Option 3')).toBeInTheDocument();
    });
  });

  it('renders labels and separators', async () => {
    const user = userEvent.setup();
    
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Complex Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Copy</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Danger Zone</DropdownMenuLabel>
          <DropdownMenuItem>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    await user.click(screen.getByText('Complex Menu'));
    
    await waitFor(() => {
      expect(screen.getByText('Actions')).toBeInTheDocument();
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Copy')).toBeInTheDocument();
      expect(screen.getByText('Danger Zone')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
  });

  it('renders shortcuts', async () => {
    const user = userEvent.setup();
    
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Menu with Shortcuts</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            Copy
            <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Paste
            <DropdownMenuShortcut>⌘V</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    await user.click(screen.getByText('Menu with Shortcuts'));
    
    await waitFor(() => {
      expect(screen.getByText('⌘C')).toBeInTheDocument();
      expect(screen.getByText('⌘V')).toBeInTheDocument();
    });
  });

  it('supports sub menus', async () => {
    const user = userEvent.setup();
    
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Main Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Regular Item</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>More Options</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Sub Item 1</DropdownMenuItem>
              <DropdownMenuItem>Sub Item 2</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    await user.click(screen.getByText('Main Menu'));
    
    await waitFor(() => {
      expect(screen.getByText('Regular Item')).toBeInTheDocument();
      expect(screen.getByText('More Options')).toBeInTheDocument();
    });

    // Hover over sub trigger to open submenu
    await user.hover(screen.getByText('More Options'));
    
    await waitFor(() => {
      expect(screen.getByText('Sub Item 1')).toBeInTheDocument();
      expect(screen.getByText('Sub Item 2')).toBeInTheDocument();
    });
  });

  it('applies correct CSS classes', async () => {
    const user = userEvent.setup();
    
    render(
      <DropdownMenu>
        <DropdownMenuTrigger className="custom-trigger">Menu</DropdownMenuTrigger>
        <DropdownMenuContent className="custom-content">
          <DropdownMenuLabel className="custom-label">Label</DropdownMenuLabel>
          <DropdownMenuItem className="custom-item">Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const trigger = screen.getByText('Menu');
    expect(trigger).toHaveClass('custom-trigger');

    await user.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByText('Label')).toHaveClass('custom-label');
      expect(screen.getByText('Item')).toHaveClass('custom-item');
    });
  });

  it('closes menu when clicking outside', async () => {
    const user = userEvent.setup();
    
    render(
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <button>Outside Button</button>
      </div>
    );

    await user.click(screen.getByText('Menu'));
    
    await waitFor(() => {
      expect(screen.getByText('Item')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Outside Button'));
    
    await waitFor(() => {
      expect(screen.queryByText('Item')).not.toBeInTheDocument();
    });
  });

  it('supports disabled items', async () => {
    const onItemClick = jest.fn();
    const user = userEvent.setup();
    
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem disabled onClick={onItemClick}>
            Disabled Item
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    await user.click(screen.getByText('Menu'));
    
    await waitFor(() => {
      expect(screen.getByText('Disabled Item')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Disabled Item'));
    expect(onItemClick).not.toHaveBeenCalled();
  });
});
