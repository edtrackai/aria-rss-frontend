import React from 'react';
import { render, screen } from '@testing-library/react';
import { Separator } from '../separator';

describe('Separator', () => {
  it('renders a horizontal separator by default', () => {
    render(<Separator data-testid="separator" />);
    
    const separator = screen.getByTestId('separator');
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('renders a vertical separator when orientation is specified', () => {
    render(<Separator orientation="vertical" data-testid="vertical-separator" />);
    
    const separator = screen.getByTestId('vertical-separator');
    expect(separator).toHaveAttribute('data-orientation', 'vertical');
  });

  it('applies correct CSS classes', () => {
    render(<Separator className="custom-separator" data-testid="separator" />);
    
    const separator = screen.getByTestId('separator');
    expect(separator).toHaveClass('custom-separator');
  });

  it('supports decorative role by default', () => {
    render(<Separator data-testid="separator" />);
    
    const separator = screen.getByTestId('separator');
    expect(separator).toHaveAttribute('role', 'separator');
    expect(separator).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('supports vertical orientation with correct ARIA attributes', () => {
    render(<Separator orientation="vertical" data-testid="separator" />);
    
    const separator = screen.getByTestId('separator');
    expect(separator).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('can be used in navigation contexts', () => {
    render(
      <nav data-testid="navigation">
        <a href="/home">Home</a>
        <Separator orientation="vertical" className="mx-2" data-testid="nav-separator" />
        <a href="/about">About</a>
        <Separator orientation="vertical" className="mx-2" />
        <a href="/contact">Contact</a>
      </nav>
    );

    const navigation = screen.getByTestId('navigation');
    const separator = screen.getByTestId('nav-separator');
    
    expect(navigation).toContainElement(separator);
    expect(separator).toHaveAttribute('data-orientation', 'vertical');
    expect(separator).toHaveClass('mx-2');
  });

  it('can be used in menu contexts', () => {
    render(
      <div role="menu" data-testid="menu">
        <div role="menuitem">New File</div>
        <div role="menuitem">Open File</div>
        <Separator className="my-1" data-testid="menu-separator" />
        <div role="menuitem">Exit</div>
      </div>
    );

    const menu = screen.getByTestId('menu');
    const separator = screen.getByTestId('menu-separator');
    
    expect(menu).toContainElement(separator);
    expect(separator).toHaveClass('my-1');
  });

  it('works in form contexts', () => {
    render(
      <form data-testid="form">
        <fieldset>
          <legend>Personal Information</legend>
          <input type="text" placeholder="Name" />
          <input type="email" placeholder="Email" />
        </fieldset>
        
        <Separator className="my-4" data-testid="form-separator" />
        
        <fieldset>
          <legend>Address Information</legend>
          <input type="text" placeholder="Street" />
          <input type="text" placeholder="City" />
        </fieldset>
      </form>
    );

    const form = screen.getByTestId('form');
    const separator = screen.getByTestId('form-separator');
    
    expect(form).toContainElement(separator);
    expect(separator).toHaveClass('my-4');
  });

  it('supports custom styling for different contexts', () => {
    render(
      <div>
        <Separator className="border-red-500" data-testid="colored-separator" />
        <Separator className="border-dashed" data-testid="dashed-separator" />
        <Separator className="border-2" data-testid="thick-separator" />
      </div>
    );

    expect(screen.getByTestId('colored-separator')).toHaveClass('border-red-500');
    expect(screen.getByTestId('dashed-separator')).toHaveClass('border-dashed');
    expect(screen.getByTestId('thick-separator')).toHaveClass('border-2');
  });

  it('maintains proper spacing in layouts', () => {
    render(
      <div className="space-y-4" data-testid="layout">
        <section>
          <h2>Section 1</h2>
          <p>Content for section 1</p>
        </section>
        
        <Separator data-testid="section-separator" />
        
        <section>
          <h2>Section 2</h2>
          <p>Content for section 2</p>
        </section>
      </div>
    );

    const layout = screen.getByTestId('layout');
    const separator = screen.getByTestId('section-separator');
    
    expect(layout).toContainElement(separator);
    expect(separator).toBeInTheDocument();
  });

  it('works in card layouts', () => {
    render(
      <div className="card" data-testid="card">
        <header className="card-header">
          <h3>Card Title</h3>
        </header>
        
        <Separator data-testid="header-separator" />
        
        <div className="card-content">
          <p>Card content goes here</p>
        </div>
        
        <Separator data-testid="footer-separator" />
        
        <footer className="card-footer">
          <button>Action</button>
        </footer>
      </div>
    );

    const card = screen.getByTestId('card');
    const headerSeparator = screen.getByTestId('header-separator');
    const footerSeparator = screen.getByTestId('footer-separator');
    
    expect(card).toContainElement(headerSeparator);
    expect(card).toContainElement(footerSeparator);
  });

  it('supports responsive design classes', () => {
    render(
      <Separator 
        className="block md:hidden lg:block" 
        data-testid="responsive-separator" 
      />
    );

    const separator = screen.getByTestId('responsive-separator');
    expect(separator).toHaveClass('block', 'md:hidden', 'lg:block');
  });

  it('can be combined with flex layouts', () => {
    render(
      <div className="flex items-center space-x-2" data-testid="flex-layout">
        <span>Item 1</span>
        <Separator orientation="vertical" className="h-4" data-testid="flex-separator" />
        <span>Item 2</span>
        <Separator orientation="vertical" className="h-4" />
        <span>Item 3</span>
      </div>
    );

    const flexLayout = screen.getByTestId('flex-layout');
    const separator = screen.getByTestId('flex-separator');
    
    expect(flexLayout).toContainElement(separator);
    expect(separator).toHaveAttribute('data-orientation', 'vertical');
    expect(separator).toHaveClass('h-4');
  });

  it('maintains semantic meaning in lists', () => {
    render(
      <ul data-testid="list">
        <li>First item</li>
        <li role="none">
          <Separator data-testid="list-separator" />
        </li>
        <li>Second item</li>
      </ul>
    );

    const list = screen.getByTestId('list');
    const separator = screen.getByTestId('list-separator');
    
    expect(list).toContainElement(separator);
  });

  it('works with dark mode classes', () => {
    render(
      <Separator 
        className="border-gray-200 dark:border-gray-700" 
        data-testid="dark-mode-separator" 
      />
    );

    const separator = screen.getByTestId('dark-mode-separator');
    expect(separator).toHaveClass('border-gray-200', 'dark:border-gray-700');
  });

  it('supports animation classes', () => {
    render(
      <Separator 
        className="transition-colors duration-200" 
        data-testid="animated-separator" 
      />
    );

    const separator = screen.getByTestId('animated-separator');
    expect(separator).toHaveClass('transition-colors', 'duration-200');
  });

  it('can be hidden conditionally', () => {
    const ConditionalSeparator = ({ show }: { show: boolean }) => (
      <div>
        <div>Content 1</div>
        {show && <Separator data-testid="conditional-separator" />}
        <div>Content 2</div>
      </div>
    );

    const { rerender } = render(<ConditionalSeparator show={true} />);
    expect(screen.getByTestId('conditional-separator')).toBeInTheDocument();

    rerender(<ConditionalSeparator show={false} />);
    expect(screen.queryByTestId('conditional-separator')).not.toBeInTheDocument();
  });

  it('maintains proper ARIA role and attributes', () => {
    render(<Separator data-testid="aria-separator" />);
    
    const separator = screen.getByTestId('aria-separator');
    expect(separator).toHaveAttribute('role', 'separator');
    expect(separator).toHaveAttribute('aria-orientation', 'horizontal');
    expect(separator).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('supports ref forwarding', () => {
    const ref = React.createRef<HTMLDivElement>();
    
    render(<Separator ref={ref} data-testid="ref-separator" />);
    
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current).toBe(screen.getByTestId('ref-separator'));
  });
});
