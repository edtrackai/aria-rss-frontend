import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from '../table';

describe('Table', () => {
  it('renders a basic table with headers and data', () => {
    render(
      <Table>
        <TableCaption>A list of users</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>John Doe</TableCell>
            <TableCell>john@example.com</TableCell>
            <TableCell>Admin</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Jane Smith</TableCell>
            <TableCell>jane@example.com</TableCell>
            <TableCell>User</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    expect(screen.getByText('A list of users')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('renders table with footer', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Laptop</TableCell>
            <TableCell>$999</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Mouse</TableCell>
            <TableCell>$29</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Total</TableCell>
            <TableCell>$1,028</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    );

    expect(screen.getByText('Product')).toBeInTheDocument();
    expect(screen.getByText('Price')).toBeInTheDocument();
    expect(screen.getByText('Laptop')).toBeInTheDocument();
    expect(screen.getByText('$999')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('$1,028')).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    render(
      <Table className="custom-table">
        <TableHeader className="custom-header">
          <TableRow className="custom-header-row">
            <TableHead className="custom-head">Column 1</TableHead>
            <TableHead>Column 2</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="custom-body">
          <TableRow className="custom-row">
            <TableCell className="custom-cell">Data 1</TableCell>
            <TableCell>Data 2</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter className="custom-footer">
          <TableRow>
            <TableCell>Footer 1</TableCell>
            <TableCell>Footer 2</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    );

    const table = screen.getByRole('table');
    expect(table).toHaveClass('custom-table');
    
    const header = table.querySelector('thead');
    expect(header).toHaveClass('custom-header');
    
    const headerRow = header?.querySelector('tr');
    expect(headerRow).toHaveClass('custom-header-row');
    
    const firstHead = screen.getByText('Column 1');
    expect(firstHead).toHaveClass('custom-head');
    
    const body = table.querySelector('tbody');
    expect(body).toHaveClass('custom-body');
    
    const bodyRow = body?.querySelector('tr');
    expect(bodyRow).toHaveClass('custom-row');
    
    const firstCell = screen.getByText('Data 1');
    expect(firstCell).toHaveClass('custom-cell');
    
    const footer = table.querySelector('tfoot');
    expect(footer).toHaveClass('custom-footer');
  });

  it('supports interactive elements in cells', async () => {
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    const user = userEvent.setup();
    
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>John Doe</TableCell>
            <TableCell>
              <button onClick={onEdit}>Edit</button>
              <button onClick={onDelete}>Delete</button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    const editButton = screen.getByText('Edit');
    const deleteButton = screen.getByText('Delete');
    
    await user.click(editButton);
    expect(onEdit).toHaveBeenCalled();
    
    await user.click(deleteButton);
    expect(onDelete).toHaveBeenCalled();
  });

  it('supports sortable columns with click handlers', async () => {
    const onSort = jest.fn();
    const user = userEvent.setup();
    
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => onSort('name')} role="button">
              Name ↑
            </TableHead>
            <TableHead onClick={() => onSort('email')} role="button">
              Email
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>John Doe</TableCell>
            <TableCell>john@example.com</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    const nameHeader = screen.getByText('Name ↑');
    const emailHeader = screen.getByText('Email');
    
    await user.click(nameHeader);
    expect(onSort).toHaveBeenCalledWith('name');
    
    await user.click(emailHeader);
    expect(onSort).toHaveBeenCalledWith('email');
  });

  it('supports row selection with checkboxes', async () => {
    const onRowSelect = jest.fn();
    const user = userEvent.setup();
    
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <input type="checkbox" aria-label="Select all" />
            </TableHead>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>
              <input 
                type="checkbox" 
                onChange={() => onRowSelect('1')}
                aria-label="Select row"
              />
            </TableCell>
            <TableCell>John Doe</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <input 
                type="checkbox" 
                onChange={() => onRowSelect('2')}
                aria-label="Select row"
              />
            </TableCell>
            <TableCell>Jane Smith</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    const selectAllCheckbox = screen.getByLabelText('Select all');
    const rowCheckboxes = screen.getAllByLabelText('Select row');
    
    expect(selectAllCheckbox).toBeInTheDocument();
    expect(rowCheckboxes).toHaveLength(2);
    
    await user.click(rowCheckboxes[0]);
    expect(onRowSelect).toHaveBeenCalledWith('1');
  });

  it('handles empty table state', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={2} className="text-center">
              No data available
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    expect(screen.getByText('No data available')).toBeInTheDocument();
    const emptyCell = screen.getByText('No data available');
    expect(emptyCell).toHaveAttribute('colspan', '2');
  });

  it('supports keyboard navigation for interactive elements', async () => {
    const onAction = jest.fn();
    const user = userEvent.setup();
    
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead tabIndex={0}>Sortable Name</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>John Doe</TableCell>
            <TableCell>
              <button onClick={onAction}>Action</button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    const sortableHeader = screen.getByText('Sortable Name');
    const actionButton = screen.getByText('Action');
    
    // Tab navigation
    await user.tab();
    expect(sortableHeader).toHaveFocus();
    
    await user.tab();
    expect(actionButton).toHaveFocus();
    
    // Activate with Enter
    await user.keyboard('{Enter}');
    expect(onAction).toHaveBeenCalled();
  });

  it('renders complex table with multiple sections', () => {
    render(
      <Table>
        <TableCaption>Monthly Sales Report</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead rowSpan={2}>Product</TableHead>
            <TableHead colSpan={2}>Q1</TableHead>
            <TableHead colSpan={2}>Q2</TableHead>
          </TableRow>
          <TableRow>
            <TableHead>Jan</TableHead>
            <TableHead>Feb</TableHead>
            <TableHead>Mar</TableHead>
            <TableHead>Apr</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Laptop</TableCell>
            <TableCell>100</TableCell>
            <TableCell>120</TableCell>
            <TableCell>110</TableCell>
            <TableCell>130</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Total</TableCell>
            <TableCell>100</TableCell>
            <TableCell>120</TableCell>
            <TableCell>110</TableCell>
            <TableCell>130</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    );

    expect(screen.getByText('Monthly Sales Report')).toBeInTheDocument();
    expect(screen.getByText('Product')).toBeInTheDocument();
    expect(screen.getByText('Q1')).toBeInTheDocument();
    expect(screen.getByText('Jan')).toBeInTheDocument();
    expect(screen.getByText('Laptop')).toBeInTheDocument();
    
    const productHeader = screen.getByText('Product');
    expect(productHeader).toHaveAttribute('rowspan', '2');
    
    const q1Header = screen.getByText('Q1');
    expect(q1Header).toHaveAttribute('colspan', '2');
  });

  it('supports responsive table behavior', () => {
    render(
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-32">Long Column Name</TableHead>
              <TableHead className="min-w-48">Another Long Column</TableHead>
              <TableHead className="min-w-24">Short</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Very long content that might overflow</TableCell>
              <TableCell>More long content here</TableCell>
              <TableCell>Short</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );

    const longHeader = screen.getByText('Long Column Name');
    expect(longHeader).toHaveClass('min-w-32');
    
    const anotherHeader = screen.getByText('Another Long Column');
    expect(anotherHeader).toHaveClass('min-w-48');
  });

  it('maintains accessibility with proper table structure', () => {
    render(
      <Table>
        <TableCaption>User management table</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead scope="col">Name</TableHead>
            <TableHead scope="col">Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>John Doe</TableCell>
            <TableCell>Administrator</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    
    const caption = screen.getByText('User management table');
    expect(caption.tagName).toBe('CAPTION');
    
    const nameHeader = screen.getByText('Name');
    expect(nameHeader).toHaveAttribute('scope', 'col');
    
    const roleHeader = screen.getByText('Role');
    expect(roleHeader).toHaveAttribute('scope', 'col');
  });
});
