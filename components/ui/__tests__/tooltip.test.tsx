import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '../tooltip';

describe('Tooltip', () => {
  it('renders trigger and shows tooltip on hover', async () => {
    const user = userEvent.setup();
    
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>
            <p>Tooltip content</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    const trigger = screen.getByText('Hover me');
    expect(trigger).toBeInTheDocument();

    await user.hover(trigger);
    
    await waitFor(() => {
      expect(screen.getByText('Tooltip content')).toBeInTheDocument();
    });
  });

  it('hides tooltip when hover ends', async () => {
    const user = userEvent.setup();
    
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>
            <p>Tooltip content</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    const trigger = screen.getByText('Hover me');
    
    await user.hover(trigger);
    
    await waitFor(() => {
      expect(screen.getByText('Tooltip content')).toBeInTheDocument();
    });

    await user.unhover(trigger);
    
    await waitFor(() => {
      expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument();
    });
  });

  it('shows tooltip on focus and hides on blur', async () => {
    const user = userEvent.setup();
    
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button>Focus me</button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Tooltip on focus</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    const trigger = screen.getByText('Focus me');
    
    await user.tab(); // Focus the button
    
    await waitFor(() => {
      expect(screen.getByText('Tooltip on focus')).toBeInTheDocument();
    });

    await user.tab(); // Move focus away
    
    await waitFor(() => {
      expect(screen.queryByText('Tooltip on focus')).not.toBeInTheDocument();
    });
  });

  it('supports custom delay timing', async () => {
    const user = userEvent.setup();
    
    render(
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger>Quick tooltip</TooltipTrigger>
          <TooltipContent>
            <p>Quick content</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    const trigger = screen.getByText('Quick tooltip');
    
    await user.hover(trigger);
    
    // Should appear quickly with short delay
    await waitFor(() => {
      expect(screen.getByText('Quick content')).toBeInTheDocument();
    }, { timeout: 200 });
  });

  it('supports different positioning', async () => {
    const user = userEvent.setup();
    
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Positioned tooltip</TooltipTrigger>
          <TooltipContent side="bottom" align="end">
            <p>Bottom-end tooltip</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    const trigger = screen.getByText('Positioned tooltip');
    
    await user.hover(trigger);
    
    await waitFor(() => {
      expect(screen.getByText('Bottom-end tooltip')).toBeInTheDocument();
    });
  });

  it('applies correct CSS classes', async () => {
    const user = userEvent.setup();
    
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="custom-trigger">Trigger</TooltipTrigger>
          <TooltipContent className="custom-content">
            <p>Content</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    const trigger = screen.getByText('Trigger');
    expect(trigger).toHaveClass('custom-trigger');

    await user.hover(trigger);
    
    await waitFor(() => {
      const content = screen.getByText('Content');
      expect(content.closest('[class*="custom-content"]')).toBeInTheDocument();
    });
  });

  it('supports controlled state', async () => {
    const onOpenChange = jest.fn();
    
    const ControlledTooltip = () => {
      const [open, setOpen] = React.useState(false);
      
      return (
        <TooltipProvider>
          <Tooltip open={open} onOpenChange={(newOpen) => {
            setOpen(newOpen);
            onOpenChange(newOpen);
          }}>
            <TooltipTrigger onClick={() => setOpen(!open)}>
              Controlled trigger
            </TooltipTrigger>
            <TooltipContent>
              <p>Controlled content</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    };

    render(<ControlledTooltip />);

    const trigger = screen.getByText('Controlled trigger');
    await userEvent.click(trigger);

    expect(onOpenChange).toHaveBeenCalledWith(true);
    
    await waitFor(() => {
      expect(screen.getByText('Controlled content')).toBeInTheDocument();
    });
  });

  it('supports custom offset', async () => {
    const user = userEvent.setup();
    
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Offset tooltip</TooltipTrigger>
          <TooltipContent sideOffset={20}>
            <p>Offset content</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    const trigger = screen.getByText('Offset tooltip');
    
    await user.hover(trigger);
    
    await waitFor(() => {
      expect(screen.getByText('Offset content')).toBeInTheDocument();
    });
  });

  it('handles multiple tooltips with provider', async () => {
    const user = userEvent.setup();
    
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>First trigger</TooltipTrigger>
          <TooltipContent>
            <p>First tooltip</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger>Second trigger</TooltipTrigger>
          <TooltipContent>
            <p>Second tooltip</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    const firstTrigger = screen.getByText('First trigger');
    const secondTrigger = screen.getByText('Second trigger');

    await user.hover(firstTrigger);
    
    await waitFor(() => {
      expect(screen.getByText('First tooltip')).toBeInTheDocument();
    });

    await user.hover(secondTrigger);
    
    await waitFor(() => {
      expect(screen.getByText('Second tooltip')).toBeInTheDocument();
    });
  });

  it('supports skip delay between tooltips', async () => {
    const user = userEvent.setup();
    
    render(
      <TooltipProvider skipDelayDuration={100}>
        <Tooltip>
          <TooltipTrigger>First</TooltipTrigger>
          <TooltipContent>
            <p>First tooltip</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger>Second</TooltipTrigger>
          <TooltipContent>
            <p>Second tooltip</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    const firstTrigger = screen.getByText('First');
    const secondTrigger = screen.getByText('Second');

    // Hover first tooltip
    await user.hover(firstTrigger);
    
    await waitFor(() => {
      expect(screen.getByText('First tooltip')).toBeInTheDocument();
    });

    // Quickly move to second tooltip
    await user.unhover(firstTrigger);
    await user.hover(secondTrigger);
    
    // Second tooltip should appear quickly due to skip delay
    await waitFor(() => {
      expect(screen.getByText('Second tooltip')).toBeInTheDocument();
    });
  });

  it('handles disabled trigger', async () => {
    const user = userEvent.setup();
    
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button disabled>Disabled button</button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Tooltip for disabled</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    const trigger = screen.getByText('Disabled button');
    expect(trigger).toBeDisabled();

    // Even disabled elements can show tooltips
    await user.hover(trigger);
    
    await waitFor(() => {
      expect(screen.getByText('Tooltip for disabled')).toBeInTheDocument();
    });
  });

  it('supports rich content in tooltip', async () => {
    const user = userEvent.setup();
    
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Rich tooltip</TooltipTrigger>
          <TooltipContent>
            <div>
              <h4>Tooltip Title</h4>
              <p>Description text</p>
              <small>Additional info</small>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    const trigger = screen.getByText('Rich tooltip');
    
    await user.hover(trigger);
    
    await waitFor(() => {
      expect(screen.getByText('Tooltip Title')).toBeInTheDocument();
      expect(screen.getByText('Description text')).toBeInTheDocument();
      expect(screen.getByText('Additional info')).toBeInTheDocument();
    });
  });
});
