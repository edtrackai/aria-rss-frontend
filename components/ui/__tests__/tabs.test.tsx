import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '../tabs';

describe('Tabs', () => {
  it('renders tabs with triggers and content', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          <TabsTrigger value="tab3">Tab 3</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">
          <p>Content for Tab 1</p>
        </TabsContent>
        <TabsContent value="tab2">
          <p>Content for Tab 2</p>
        </TabsContent>
        <TabsContent value="tab3">
          <p>Content for Tab 3</p>
        </TabsContent>
      </Tabs>
    );

    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
    expect(screen.getByText('Tab 3')).toBeInTheDocument();
    expect(screen.getByText('Content for Tab 1')).toBeInTheDocument();
  });

  it('switches tabs when clicking on triggers', async () => {
    const user = userEvent.setup();
    
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">
          <p>Content for Tab 1</p>
        </TabsContent>
        <TabsContent value="tab2">
          <p>Content for Tab 2</p>
        </TabsContent>
      </Tabs>
    );

    expect(screen.getByText('Content for Tab 1')).toBeInTheDocument();
    expect(screen.queryByText('Content for Tab 2')).not.toBeInTheDocument();

    await user.click(screen.getByText('Tab 2'));
    
    await waitFor(() => {
      expect(screen.queryByText('Content for Tab 1')).not.toBeInTheDocument();
      expect(screen.getByText('Content for Tab 2')).toBeInTheDocument();
    });
  });

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup();
    
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          <TabsTrigger value="tab3">Tab 3</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
        <TabsContent value="tab3">Content 3</TabsContent>
      </Tabs>
    );

    const firstTab = screen.getByText('Tab 1');
    firstTab.focus();
    
    // Navigate with arrow keys
    await user.keyboard('{ArrowRight}');
    expect(screen.getByText('Tab 2')).toHaveFocus();
    
    await user.keyboard('{ArrowRight}');
    expect(screen.getByText('Tab 3')).toHaveFocus();
    
    // Activate with Space or Enter
    await user.keyboard('{Enter}');
    
    await waitFor(() => {
      expect(screen.getByText('Content 3')).toBeInTheDocument();
    });
  });

  it('supports controlled state', async () => {
    const onValueChange = jest.fn();
    
    const ControlledTabs = () => {
      const [value, setValue] = React.useState('tab1');
      
      return (
        <Tabs value={value} onValueChange={(newValue) => {
          setValue(newValue);
          onValueChange(newValue);
        }}>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Controlled Content 1</TabsContent>
          <TabsContent value="tab2">Controlled Content 2</TabsContent>
        </Tabs>
      );
    };

    render(<ControlledTabs />);

    expect(screen.getByText('Controlled Content 1')).toBeInTheDocument();
    
    await userEvent.click(screen.getByText('Tab 2'));
    expect(onValueChange).toHaveBeenCalledWith('tab2');
    
    await waitFor(() => {
      expect(screen.getByText('Controlled Content 2')).toBeInTheDocument();
    });
  });

  it('applies correct CSS classes and data attributes', async () => {
    const user = userEvent.setup();
    
    render(
      <Tabs defaultValue="tab1" className="custom-tabs">
        <TabsList className="custom-list">
          <TabsTrigger value="tab1" className="custom-trigger">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" className="custom-content">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );

    const tabs = screen.getByRole('tablist').closest('[role="tablist"]')?.parentElement;
    expect(tabs).toHaveClass('custom-tabs');
    
    const tabsList = screen.getByRole('tablist');
    expect(tabsList).toHaveClass('custom-list');
    
    const firstTab = screen.getByText('Tab 1');
    expect(firstTab).toHaveClass('custom-trigger');
    expect(firstTab).toHaveAttribute('data-state', 'active');
    
    const secondTab = screen.getByText('Tab 2');
    expect(secondTab).toHaveAttribute('data-state', 'inactive');
    
    const content = screen.getByText('Content 1');
    expect(content).toHaveClass('custom-content');
  });

  it('supports disabled tabs', async () => {
    const user = userEvent.setup();
    
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2" disabled>Tab 2 (disabled)</TabsTrigger>
          <TabsTrigger value="tab3">Tab 3</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
        <TabsContent value="tab3">Content 3</TabsContent>
      </Tabs>
    );

    const disabledTab = screen.getByText('Tab 2 (disabled)');
    expect(disabledTab).toHaveAttribute('data-disabled', 'true');
    
    await user.click(disabledTab);
    
    // Should still show content 1 (disabled tab shouldn't activate)
    expect(screen.getByText('Content 1')).toBeInTheDocument();
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
  });

  it('supports different orientations', () => {
    render(
      <Tabs defaultValue="tab1" orientation="vertical">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );

    const tabsList = screen.getByRole('tablist');
    expect(tabsList).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('handles content with interactive elements', async () => {
    const onButtonClick = jest.fn();
    const user = userEvent.setup();
    
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">
          <button onClick={onButtonClick}>Interactive Button</button>
        </TabsContent>
        <TabsContent value="tab2">
          <input placeholder="Interactive Input" />
        </TabsContent>
      </Tabs>
    );

    const button = screen.getByText('Interactive Button');
    await user.click(button);
    expect(onButtonClick).toHaveBeenCalled();
    
    await user.click(screen.getByText('Tab 2'));
    
    await waitFor(() => {
      const input = screen.getByPlaceholderText('Interactive Input');
      expect(input).toBeInTheDocument();
    });
  });

  it('supports asChild prop on triggers', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1" asChild>
            <button className="custom-button">Custom Tab 1</button>
          </TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );

    const customButton = screen.getByText('Custom Tab 1');
    expect(customButton).toHaveClass('custom-button');
    expect(customButton.tagName).toBe('BUTTON');
  });

  it('maintains focus management between tab switching', async () => {
    const user = userEvent.setup();
    
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">
          <input placeholder="Input in tab 1" />
        </TabsContent>
        <TabsContent value="tab2">
          <input placeholder="Input in tab 2" />
        </TabsContent>
      </Tabs>
    );

    const input1 = screen.getByPlaceholderText('Input in tab 1');
    await user.click(input1);
    expect(input1).toHaveFocus();
    
    await user.click(screen.getByText('Tab 2'));
    
    await waitFor(() => {
      const input2 = screen.getByPlaceholderText('Input in tab 2');
      expect(input2).toBeInTheDocument();
      // Focus should not automatically move to new tab content
      expect(input2).not.toHaveFocus();
    });
  });
});
