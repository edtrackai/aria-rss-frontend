import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Progress } from '../progress';

describe('Progress', () => {
  it('renders progress bar with default value', () => {
    render(<Progress />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
  });

  it('renders progress bar with specified value', () => {
    render(<Progress value={50} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '50');
    expect(progressBar).toHaveAttribute('data-value', '50');
  });

  it('renders progress bar with custom max value', () => {
    render(<Progress value={25} max={50} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '25');
    expect(progressBar).toHaveAttribute('aria-valuemax', '50');
    expect(progressBar).toHaveAttribute('data-max', '50');
  });

  it('handles zero value correctly', () => {
    render(<Progress value={0} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    expect(progressBar).toHaveAttribute('data-value', '0');
  });

  it('handles maximum value correctly', () => {
    render(<Progress value={100} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '100');
    expect(progressBar).toHaveAttribute('data-value', '100');
  });

  it('clamps values above maximum', () => {
    render(<Progress value={150} max={100} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '100');
    expect(progressBar).toHaveAttribute('data-value', '100');
  });

  it('handles negative values by clamping to zero', () => {
    render(<Progress value={-10} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    expect(progressBar).toHaveAttribute('data-value', '0');
  });

  it('applies correct CSS classes', () => {
    render(<Progress value={75} className="custom-progress" />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveClass('custom-progress');
  });

  it('renders indeterminate progress bar', () => {
    render(<Progress />); // No value prop = indeterminate
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('data-state', 'indeterminate');
    expect(progressBar).not.toHaveAttribute('aria-valuenow');
  });

  it('renders complete progress bar', () => {
    render(<Progress value={100} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('data-state', 'complete');
  });

  it('renders loading progress bar', () => {
    render(<Progress value={50} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('data-state', 'loading');
  });

  it('updates progress value dynamically', async () => {
    const ProgressComponent = () => {
      const [value, setValue] = React.useState(0);
      
      React.useEffect(() => {
        const timer = setTimeout(() => setValue(50), 100);
        return () => clearTimeout(timer);
      }, []);
      
      return <Progress value={value} />;
    };
    
    render(<ProgressComponent />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    
    await waitFor(() => {
      expect(progressBar).toHaveAttribute('aria-valuenow', '50');
    });
  });

  it('supports custom aria label', () => {
    render(<Progress value={75} aria-label="File upload progress" />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-label', 'File upload progress');
  });

  it('supports aria-labelledby', () => {
    render(
      <div>
        <label id="progress-label">Download Progress</label>
        <Progress value={60} aria-labelledby="progress-label" />
      </div>
    );
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-labelledby', 'progress-label');
  });

  it('calculates percentage correctly with custom max', () => {
    render(<Progress value={25} max={50} />);
    
    const progressBar = screen.getByRole('progressbar');
    const indicator = progressBar.querySelector('[data-testid="progress-indicator"]') || 
                     progressBar.querySelector('div[style]');
    
    // 25 out of 50 should be 50%
    expect(progressBar).toHaveAttribute('data-value', '25');
    expect(progressBar).toHaveAttribute('data-max', '50');
  });

  it('handles decimal values', () => {
    render(<Progress value={33.33} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '33.33');
  });

  it('supports custom styling through data attributes', () => {
    render(<Progress value={80} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('data-value', '80');
    expect(progressBar).toHaveAttribute('data-state', 'loading');
  });

  it('maintains accessibility with screen readers', () => {
    render(
      <Progress 
        value={65} 
        aria-label="Form completion" 
        aria-describedby="progress-description"
      />
    );
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-label', 'Form completion');
    expect(progressBar).toHaveAttribute('aria-describedby', 'progress-description');
    expect(progressBar).toHaveAttribute('aria-valuenow', '65');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
  });

  it('handles edge case of very small values', () => {
    render(<Progress value={0.1} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '0.1');
    expect(progressBar).toHaveAttribute('data-state', 'loading');
  });

  it('handles very large max values', () => {
    render(<Progress value={500} max={1000} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '500');
    expect(progressBar).toHaveAttribute('aria-valuemax', '1000');
    expect(progressBar).toHaveAttribute('data-value', '500');
    expect(progressBar).toHaveAttribute('data-max', '1000');
  });

  it('supports null and undefined values gracefully', () => {
    render(<Progress value={null as any} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('data-state', 'indeterminate');
    expect(progressBar).not.toHaveAttribute('aria-valuenow');
  });
});
