import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '../accordion';

describe('Accordion', () => {
  it('renders accordion items with triggers and content', () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Section 1</AccordionTrigger>
          <AccordionContent>
            <p>Content for section 1</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Section 2</AccordionTrigger>
          <AccordionContent>
            <p>Content for section 2</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    expect(screen.getByText('Section 1')).toBeInTheDocument();
    expect(screen.getByText('Section 2')).toBeInTheDocument();
  });

  it('expands and collapses single accordion item', async () => {
    const user = userEvent.setup();
    
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Section 1</AccordionTrigger>
          <AccordionContent>
            <p>Content for section 1</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const trigger = screen.getByText('Section 1');
    
    // Initially collapsed
    expect(screen.queryByText('Content for section 1')).not.toBeInTheDocument();
    
    // Click to expand
    await user.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByText('Content for section 1')).toBeInTheDocument();
    });
    
    // Click again to collapse
    await user.click(trigger);
    
    await waitFor(() => {
      expect(screen.queryByText('Content for section 1')).not.toBeInTheDocument();
    });
  });

  it('supports single type accordion (only one open at a time)', async () => {
    const user = userEvent.setup();
    
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Section 1</AccordionTrigger>
          <AccordionContent>
            <p>Content 1</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Section 2</AccordionTrigger>
          <AccordionContent>
            <p>Content 2</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    // Open first section
    await user.click(screen.getByText('Section 1'));
    
    await waitFor(() => {
      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });
    
    // Open second section (should close first)
    await user.click(screen.getByText('Section 2'));
    
    await waitFor(() => {
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });
  });

  it('supports multiple type accordion (multiple items can be open)', async () => {
    const user = userEvent.setup();
    
    render(
      <Accordion type="multiple">
        <AccordionItem value="item-1">
          <AccordionTrigger>Section 1</AccordionTrigger>
          <AccordionContent>
            <p>Content 1</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Section 2</AccordionTrigger>
          <AccordionContent>
            <p>Content 2</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    // Open first section
    await user.click(screen.getByText('Section 1'));
    
    await waitFor(() => {
      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });
    
    // Open second section (first should remain open)
    await user.click(screen.getByText('Section 2'));
    
    await waitFor(() => {
      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });
  });

  it('supports controlled state for single type', async () => {
    const onValueChange = jest.fn();
    
    const ControlledAccordion = () => {
      const [value, setValue] = React.useState('item-1');
      
      return (
        <Accordion 
          type="single" 
          value={value} 
          onValueChange={(newValue) => {
            setValue(newValue);
            onValueChange(newValue);
          }}
        >
          <AccordionItem value="item-1">
            <AccordionTrigger>Section 1</AccordionTrigger>
            <AccordionContent>
              <p>Controlled Content 1</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Section 2</AccordionTrigger>
            <AccordionContent>
              <p>Controlled Content 2</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      );
    };

    render(<ControlledAccordion />);

    // Should start with item-1 open
    expect(screen.getByText('Controlled Content 1')).toBeInTheDocument();
    
    await userEvent.click(screen.getByText('Section 2'));
    expect(onValueChange).toHaveBeenCalledWith('item-2');
  });

  it('supports controlled state for multiple type', async () => {
    const onValueChange = jest.fn();
    
    const ControlledMultipleAccordion = () => {
      const [value, setValue] = React.useState(['item-1']);
      
      return (
        <Accordion 
          type="multiple" 
          value={value} 
          onValueChange={(newValue) => {
            setValue(newValue);
            onValueChange(newValue);
          }}
        >
          <AccordionItem value="item-1">
            <AccordionTrigger>Section 1</AccordionTrigger>
            <AccordionContent>
              <p>Multiple Content 1</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Section 2</AccordionTrigger>
            <AccordionContent>
              <p>Multiple Content 2</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      );
    };

    render(<ControlledMultipleAccordion />);

    // Should start with item-1 open
    expect(screen.getByText('Multiple Content 1')).toBeInTheDocument();
    
    await userEvent.click(screen.getByText('Section 2'));
    expect(onValueChange).toHaveBeenCalledWith(['item-1', 'item-2']);
  });

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup();
    
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Section 1</AccordionTrigger>
          <AccordionContent>
            <p>Content 1</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Section 2</AccordionTrigger>
          <AccordionContent>
            <p>Content 2</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const firstTrigger = screen.getByText('Section 1');
    const secondTrigger = screen.getByText('Section 2');
    
    firstTrigger.focus();
    
    // Navigate with arrow keys
    await user.keyboard('{ArrowDown}');
    expect(secondTrigger).toHaveFocus();
    
    await user.keyboard('{ArrowUp}');
    expect(firstTrigger).toHaveFocus();
    
    // Activate with Space or Enter
    await user.keyboard('{Enter}');
    
    await waitFor(() => {
      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });
  });

  it('applies correct CSS classes and data attributes', async () => {
    const user = userEvent.setup();
    
    render(
      <Accordion type="single" collapsible className="custom-accordion">
        <AccordionItem value="item-1" className="custom-item">
          <AccordionTrigger className="custom-trigger">Section 1</AccordionTrigger>
          <AccordionContent className="custom-content">
            <p>Content 1</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const accordion = screen.getByRole('region').parentElement;
    expect(accordion).toHaveClass('custom-accordion');
    
    const item = screen.getByRole('region');
    expect(item).toHaveClass('custom-item');
    
    const trigger = screen.getByText('Section 1');
    expect(trigger).toHaveClass('custom-trigger');
    expect(trigger).toHaveAttribute('data-state', 'closed');
    
    // Open the accordion
    await user.click(trigger);
    
    await waitFor(() => {
      expect(trigger).toHaveAttribute('data-state', 'open');
      const content = screen.getByText('Content 1');
      expect(content).toHaveClass('custom-content');
    });
  });

  it('supports disabled items', async () => {
    const user = userEvent.setup();
    
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Section 1</AccordionTrigger>
          <AccordionContent>
            <p>Content 1</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2" disabled>
          <AccordionTrigger>Section 2 (disabled)</AccordionTrigger>
          <AccordionContent>
            <p>Content 2</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const disabledTrigger = screen.getByText('Section 2 (disabled)');
    expect(disabledTrigger).toHaveAttribute('data-disabled', 'true');
    
    await user.click(disabledTrigger);
    
    // Content should not appear for disabled item
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
  });

  it('handles content with interactive elements', async () => {
    const onButtonClick = jest.fn();
    const user = userEvent.setup();
    
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Interactive Section</AccordionTrigger>
          <AccordionContent>
            <button onClick={onButtonClick}>Click me</button>
            <input placeholder="Type here" />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    // Open the accordion
    await user.click(screen.getByText('Interactive Section'));
    
    await waitFor(() => {
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    // Interact with button inside content
    await user.click(screen.getByText('Click me'));
    expect(onButtonClick).toHaveBeenCalled();
    
    // Interact with input inside content
    const input = screen.getByPlaceholderText('Type here');
    await user.type(input, 'test');
    expect(input).toHaveValue('test');
  });

  it('maintains proper accessibility attributes', async () => {
    const user = userEvent.setup();
    
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Accessible Section</AccordionTrigger>
          <AccordionContent>
            <p>Accessible content</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const trigger = screen.getByText('Accessible Section');
    const content = screen.getByText('Accessible content').closest('[role="region"]');
    
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(content).toHaveAttribute('aria-labelledby');
    expect(content).toHaveStyle('display: none');
    
    await user.click(trigger);
    
    await waitFor(() => {
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(content).not.toHaveStyle('display: none');
    });
  });

  it('supports default open items', () => {
    render(
      <Accordion type="single" defaultValue="item-2">
        <AccordionItem value="item-1">
          <AccordionTrigger>Section 1</AccordionTrigger>
          <AccordionContent>
            <p>Content 1</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Section 2</AccordionTrigger>
          <AccordionContent>
            <p>Content 2</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    // Section 2 should be open by default
    expect(screen.getByText('Content 2')).toBeInTheDocument();
    expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
  });
});
