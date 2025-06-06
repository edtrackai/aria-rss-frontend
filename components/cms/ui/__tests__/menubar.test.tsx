import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarCheckboxItem,
  MenubarRadioItem,
  MenubarLabel,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarRadioGroup,
} from '../menubar';

describe('Menubar', () => {
  it('renders menubar with multiple menus', async () => {
    const user = userEvent.setup();
    
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New File</MenubarItem>
            <MenubarItem>Open File</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Cut</MenubarItem>
            <MenubarItem>Copy</MenubarItem>
            <MenubarItem>Paste</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    );

    expect(screen.getByText('File')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();

    // Open File menu
    await user.click(screen.getByText('File'));
    
    await waitFor(() => {
      expect(screen.getByText('New File')).toBeInTheDocument();
      expect(screen.getByText('Open File')).toBeInTheDocument();
    });
  });

  it('executes menu item click handlers', async () => {
    const onNewFile = jest.fn();
    const user = userEvent.setup();
    
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={onNewFile}>New File</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    );

    await user.click(screen.getByText('File'));
    
    await waitFor(() => {
      expect(screen.getByText('New File')).toBeInTheDocument();
    });

    await user.click(screen.getByText('New File'));
    expect(onNewFile).toHaveBeenCalled();
  });

  it('supports keyboard navigation between menus', async () => {
    const user = userEvent.setup();
    
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New File</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Cut</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Zoom In</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    );

    // Focus on File menu
    screen.getByText('File').focus();
    
    // Navigate to Edit menu with arrow keys
    await user.keyboard('{ArrowRight}');
    expect(screen.getByText('Edit')).toHaveFocus();

    // Navigate to View menu
    await user.keyboard('{ArrowRight}');
    expect(screen.getByText('View')).toHaveFocus();

    // Navigate back to File menu
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByText('Edit')).toHaveFocus();
  });

  it('renders menu items with shortcuts', async () => {
    const user = userEvent.setup();
    
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              Cut
              <MenubarShortcut>⌘X</MenubarShortcut>
            </MenubarItem>
            <MenubarItem>
              Copy
              <MenubarShortcut>⌘C</MenubarShortcut>
            </MenubarItem>
            <MenubarItem>
              Paste
              <MenubarShortcut>⌘V</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    );

    await user.click(screen.getByText('Edit'));
    
    await waitFor(() => {
      expect(screen.getByText('⌘X')).toBeInTheDocument();
      expect(screen.getByText('⌘C')).toBeInTheDocument();
      expect(screen.getByText('⌘V')).toBeInTheDocument();
    });
  });

  it('renders checkbox items with state', async () => {
    const user = userEvent.setup();
    const [wordWrap, setWordWrap] = [true, jest.fn()];
    
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarCheckboxItem 
              checked={wordWrap} 
              onCheckedChange={setWordWrap}
            >
              Word Wrap
            </MenubarCheckboxItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    );

    await user.click(screen.getByText('View'));
    
    await waitFor(() => {
      expect(screen.getByText('Word Wrap')).toBeInTheDocument();
    });
  });

  it('renders radio items with groups', async () => {
    const user = userEvent.setup();
    const [theme, setTheme] = ['light', jest.fn()];
    
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>Preferences</MenubarTrigger>
          <MenubarContent>
            <MenubarLabel>Theme</MenubarLabel>
            <MenubarRadioGroup value={theme} onValueChange={setTheme}>
              <MenubarRadioItem value="light">Light</MenubarRadioItem>
              <MenubarRadioItem value="dark">Dark</MenubarRadioItem>
              <MenubarRadioItem value="system">System</MenubarRadioItem>
            </MenubarRadioGroup>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    );

    await user.click(screen.getByText('Preferences'));
    
    await waitFor(() => {
      expect(screen.getByText('Theme')).toBeInTheDocument();
      expect(screen.getByText('Light')).toBeInTheDocument();
      expect(screen.getByText('Dark')).toBeInTheDocument();
      expect(screen.getByText('System')).toBeInTheDocument();
    });
  });

  it('renders separators and labels', async () => {
    const user = userEvent.setup();
    
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarLabel>Recent Files</MenubarLabel>
            <MenubarItem>Document1.txt</MenubarItem>
            <MenubarItem>Document2.txt</MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Open...</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    );

    await user.click(screen.getByText('File'));
    
    await waitFor(() => {
      expect(screen.getByText('Recent Files')).toBeInTheDocument();
      expect(screen.getByText('Document1.txt')).toBeInTheDocument();
      expect(screen.getByText('Document2.txt')).toBeInTheDocument();
      expect(screen.getByText('Open...')).toBeInTheDocument();
    });
  });

  it('supports sub menus', async () => {
    const user = userEvent.setup();
    
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>Tools</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Settings</MenubarItem>
            <MenubarSub>
              <MenubarSubTrigger>Advanced</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem>Developer Tools</MenubarItem>
                <MenubarItem>Debug Mode</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    );

    await user.click(screen.getByText('Tools'));
    
    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Advanced')).toBeInTheDocument();
    });

    // Hover over sub trigger to open submenu
    await user.hover(screen.getByText('Advanced'));
    
    await waitFor(() => {
      expect(screen.getByText('Developer Tools')).toBeInTheDocument();
      expect(screen.getByText('Debug Mode')).toBeInTheDocument();
    });
  });

  it('applies correct CSS classes', async () => {
    const user = userEvent.setup();
    
    render(
      <Menubar className="custom-menubar">
        <MenubarMenu>
          <MenubarTrigger className="custom-trigger">File</MenubarTrigger>
          <MenubarContent className="custom-content">
            <MenubarLabel className="custom-label">Actions</MenubarLabel>
            <MenubarItem className="custom-item">New</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    );

    const menubar = screen.getByRole('menubar');
    expect(menubar).toHaveClass('custom-menubar');
    
    const trigger = screen.getByText('File');
    expect(trigger).toHaveClass('custom-trigger');

    await user.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByText('Actions')).toHaveClass('custom-label');
      expect(screen.getByText('New')).toHaveClass('custom-item');
    });
  });

  it('supports disabled items', async () => {
    const onItemClick = jest.fn();
    const user = userEvent.setup();
    
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem disabled onClick={onItemClick}>
              Save (disabled)
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    );

    await user.click(screen.getByText('File'));
    
    await waitFor(() => {
      expect(screen.getByText('Save (disabled)')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Save (disabled)'));
    expect(onItemClick).not.toHaveBeenCalled();
  });

  it('closes menu when clicking outside', async () => {
    const user = userEvent.setup();
    
    render(
      <div>
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>New</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
        <button>Outside Button</button>
      </div>
    );

    await user.click(screen.getByText('File'));
    
    await waitFor(() => {
      expect(screen.getByText('New')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Outside Button'));
    
    await waitFor(() => {
      expect(screen.queryByText('New')).not.toBeInTheDocument();
    });
  });
});
