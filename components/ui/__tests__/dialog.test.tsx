import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '../dialog';

describe('Dialog', () => {
  it('renders trigger and opens dialog on click', async () => {
    const user = userEvent.setup();
    
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Dialog</DialogTitle>
            <DialogDescription>Test description</DialogDescription>
          </DialogHeader>
          <p>Dialog content</p>
          <DialogFooter>
            <DialogClose>Close</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );

    const trigger = screen.getByText('Open Dialog');
    expect(trigger).toBeInTheDocument();

    await user.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByText('Test Dialog')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('Dialog content')).toBeInTheDocument();
  });

  it('closes dialog when close button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Test Dialog</DialogTitle>
          <DialogClose>Close</DialogClose>
        </DialogContent>
      </Dialog>
    );

    await user.click(screen.getByText('Open Dialog'));
    
    await waitFor(() => {
      expect(screen.getByText('Test Dialog')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Close'));
    
    await waitFor(() => {
      expect(screen.queryByText('Test Dialog')).not.toBeInTheDocument();
    });
  });

  it('closes dialog when escape key is pressed', async () => {
    const user = userEvent.setup();
    
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Test Dialog</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    await user.click(screen.getByText('Open Dialog'));
    
    await waitFor(() => {
      expect(screen.getByText('Test Dialog')).toBeInTheDocument();
    });

    await user.keyboard('{Escape}');
    
    await waitFor(() => {
      expect(screen.queryByText('Test Dialog')).not.toBeInTheDocument();
    });
  });

  it('traps focus within dialog', async () => {
    const user = userEvent.setup();
    
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Test Dialog</DialogTitle>
          <input placeholder="First input" />
          <input placeholder="Second input" />
          <DialogClose>Close</DialogClose>
        </DialogContent>
      </Dialog>
    );

    await user.click(screen.getByText('Open Dialog'));
    
    await waitFor(() => {
      expect(screen.getByText('Test Dialog')).toBeInTheDocument();
    });

    // Focus should be trapped within the dialog
    const firstInput = screen.getByPlaceholderText('First input');
    const secondInput = screen.getByPlaceholderText('Second input');
    const closeButton = screen.getByText('Close');

    await user.tab();
    expect(firstInput).toHaveFocus();

    await user.tab();
    expect(secondInput).toHaveFocus();

    await user.tab();
    expect(closeButton).toHaveFocus();
  });

  it('applies correct CSS classes', async () => {
    const user = userEvent.setup();
    
    render(
      <Dialog>
        <DialogTrigger className="custom-trigger">Open</DialogTrigger>
        <DialogContent className="custom-content">
          <DialogHeader className="custom-header">
            <DialogTitle className="custom-title">Title</DialogTitle>
            <DialogDescription className="custom-description">
              Description
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="custom-footer">
            <DialogClose className="custom-close">Close</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );

    const trigger = screen.getByText('Open');
    expect(trigger).toHaveClass('custom-trigger');

    await user.click(trigger);
    
    await waitFor(() => {
      const content = screen.getByRole('dialog');
      expect(content).toHaveClass('custom-content');
    });

    expect(screen.getByText('Title')).toHaveClass('custom-title');
    expect(screen.getByText('Description')).toHaveClass('custom-description');
  });

  it('supports controlled state', async () => {
    const onOpenChange = jest.fn();
    
    const ControlledDialog = () => {
      const [open, setOpen] = React.useState(false);
      
      return (
        <Dialog open={open} onOpenChange={(newOpen) => {
          setOpen(newOpen);
          onOpenChange(newOpen);
        }}>
          <DialogTrigger onClick={() => setOpen(true)}>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Controlled Dialog</DialogTitle>
            <DialogClose onClick={() => setOpen(false)}>Close</DialogClose>
          </DialogContent>
        </Dialog>
      );
    };

    render(<ControlledDialog />);

    const trigger = screen.getByText('Open');
    await userEvent.click(trigger);

    expect(onOpenChange).toHaveBeenCalledWith(true);
    
    await waitFor(() => {
      expect(screen.getByText('Controlled Dialog')).toBeInTheDocument();
    });

    const closeButton = screen.getByText('Close');
    await userEvent.click(closeButton);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('handles aria attributes correctly', async () => {
    const user = userEvent.setup();
    
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent aria-describedby="description">
          <DialogTitle>Accessible Dialog</DialogTitle>
          <DialogDescription id="description">
            This is an accessible dialog
          </DialogDescription>
        </DialogContent>
      </Dialog>
    );

    await user.click(screen.getByText('Open Dialog'));
    
    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-describedby', 'description');
    });
  });
});
