import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '../alert-dialog';

describe('AlertDialog', () => {
  it('renders trigger and opens alert dialog on click', async () => {
    const user = userEvent.setup();
    
    render(
      <AlertDialog>
        <AlertDialogTrigger>Delete Item</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this item?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );

    const trigger = screen.getByText('Delete Item');
    expect(trigger).toBeInTheDocument();

    await user.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Are you sure you want to delete this item?')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('closes dialog when cancel button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <AlertDialog>
        <AlertDialogTrigger>Delete Item</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );

    await user.click(screen.getByText('Delete Item'));
    
    await waitFor(() => {
      expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Cancel'));
    
    await waitFor(() => {
      expect(screen.queryByText('Confirm Deletion')).not.toBeInTheDocument();
    });
  });

  it('executes action and closes dialog when action button is clicked', async () => {
    const onAction = jest.fn();
    const user = userEvent.setup();
    
    render(
      <AlertDialog>
        <AlertDialogTrigger>Delete Item</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onAction}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );

    await user.click(screen.getByText('Delete Item'));
    
    await waitFor(() => {
      expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Delete'));
    
    expect(onAction).toHaveBeenCalled();
    
    await waitFor(() => {
      expect(screen.queryByText('Confirm Deletion')).not.toBeInTheDocument();
    });
  });

  it('prevents closing on escape key (alert dialog behavior)', async () => {
    const user = userEvent.setup();
    
    render(
      <AlertDialog>
        <AlertDialogTrigger>Delete Item</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );

    await user.click(screen.getByText('Delete Item'));
    
    await waitFor(() => {
      expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
    });

    await user.keyboard('{Escape}');
    
    // Alert dialog should still be open (escape disabled for alerts)
    expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
  });

  it('applies correct CSS classes and variants', async () => {
    const user = userEvent.setup();
    
    render(
      <AlertDialog>
        <AlertDialogTrigger className="custom-trigger">Delete</AlertDialogTrigger>
        <AlertDialogContent className="custom-content">
          <AlertDialogHeader className="custom-header">
            <AlertDialogTitle className="custom-title">Title</AlertDialogTitle>
            <AlertDialogDescription className="custom-description">
              Description
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="custom-footer">
            <AlertDialogCancel className="custom-cancel">Cancel</AlertDialogCancel>
            <AlertDialogAction className="custom-action">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );

    const trigger = screen.getByText('Delete');
    expect(trigger).toHaveClass('custom-trigger');

    await user.click(trigger);
    
    await waitFor(() => {
      const content = screen.getByRole('alertdialog');
      expect(content).toHaveClass('custom-content');
    });

    expect(screen.getByText('Title')).toHaveClass('custom-title');
    expect(screen.getByText('Description')).toHaveClass('custom-description');
    expect(screen.getByText('Cancel')).toHaveClass('custom-cancel');
    expect(screen.getByText('Delete')).toHaveClass('custom-action');
  });

  it('supports controlled state', async () => {
    const onOpenChange = jest.fn();
    
    const ControlledAlertDialog = () => {
      const [open, setOpen] = React.useState(false);
      
      return (
        <AlertDialog open={open} onOpenChange={(newOpen) => {
          setOpen(newOpen);
          onOpenChange(newOpen);
        }}>
          <AlertDialogTrigger onClick={() => setOpen(true)}>Delete</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogTitle>Controlled Alert</AlertDialogTitle>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setOpen(false)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => setOpen(false)}>Confirm</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    };

    render(<ControlledAlertDialog />);

    const trigger = screen.getByText('Delete');
    await userEvent.click(trigger);

    expect(onOpenChange).toHaveBeenCalledWith(true);
    
    await waitFor(() => {
      expect(screen.getByText('Controlled Alert')).toBeInTheDocument();
    });

    const cancelButton = screen.getByText('Cancel');
    await userEvent.click(cancelButton);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('has correct accessibility attributes', async () => {
    const user = userEvent.setup();
    
    render(
      <AlertDialog>
        <AlertDialogTrigger>Delete Item</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );

    await user.click(screen.getByText('Delete Item'));
    
    await waitFor(() => {
      const alertDialog = screen.getByRole('alertdialog');
      expect(alertDialog).toBeInTheDocument();
      expect(alertDialog).toHaveAttribute('aria-labelledby');
      expect(alertDialog).toHaveAttribute('aria-describedby');
    });
  });

  it('handles multiple action buttons', async () => {
    const onSave = jest.fn();
    const onDelete = jest.fn();
    const user = userEvent.setup();
    
    render(
      <AlertDialog>
        <AlertDialogTrigger>Multiple Actions</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Choose Action</AlertDialogTitle>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onSave}>Save</AlertDialogAction>
            <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );

    await user.click(screen.getByText('Multiple Actions'));
    
    await waitFor(() => {
      expect(screen.getByText('Choose Action')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Save'));
    expect(onSave).toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();
  });
});
