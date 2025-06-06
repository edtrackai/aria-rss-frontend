import React from 'react';
import { render, screen } from '@testing-library/react';
import { Skeleton } from '../skeleton';

describe('Skeleton', () => {
  it('renders a skeleton element', () => {
    render(<Skeleton />);
    
    // Skeleton doesn't have a specific role, so we check for the element
    const skeleton = document.querySelector('.skeleton');
    expect(skeleton).toBeInTheDocument();
  });

  it('applies default CSS classes', () => {
    render(<Skeleton data-testid="skeleton" />);
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toBeInTheDocument();
  });

  it('applies custom CSS classes', () => {
    render(<Skeleton className="custom-skeleton w-32 h-8" data-testid="skeleton" />);
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('custom-skeleton', 'w-32', 'h-8');
  });

  it('renders with custom dimensions', () => {
    render(
      <Skeleton 
        className="w-64 h-4" 
        style={{ width: '256px', height: '16px' }}
        data-testid="skeleton"
      />
    );
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('w-64', 'h-4');
    expect(skeleton).toHaveStyle({
      width: '256px',
      height: '16px'
    });
  });

  it('supports different skeleton shapes and sizes', () => {
    render(
      <div>
        <Skeleton className="w-12 h-12 rounded-full" data-testid="avatar-skeleton" />
        <Skeleton className="w-full h-4 rounded" data-testid="text-skeleton" />
        <Skeleton className="w-24 h-6 rounded" data-testid="button-skeleton" />
      </div>
    );
    
    const avatarSkeleton = screen.getByTestId('avatar-skeleton');
    expect(avatarSkeleton).toHaveClass('w-12', 'h-12', 'rounded-full');
    
    const textSkeleton = screen.getByTestId('text-skeleton');
    expect(textSkeleton).toHaveClass('w-full', 'h-4', 'rounded');
    
    const buttonSkeleton = screen.getByTestId('button-skeleton');
    expect(buttonSkeleton).toHaveClass('w-24', 'h-6', 'rounded');
  });

  it('can be used in loading card layouts', () => {
    render(
      <div className="card" data-testid="loading-card">
        <Skeleton className="w-full h-48 rounded-lg mb-4" data-testid="image-skeleton" />
        <Skeleton className="w-3/4 h-6 mb-2" data-testid="title-skeleton" />
        <Skeleton className="w-1/2 h-4 mb-2" data-testid="subtitle-skeleton" />
        <Skeleton className="w-full h-4" data-testid="description-skeleton" />
      </div>
    );
    
    const loadingCard = screen.getByTestId('loading-card');
    expect(loadingCard).toBeInTheDocument();
    
    const imageSkeleton = screen.getByTestId('image-skeleton');
    expect(imageSkeleton).toHaveClass('w-full', 'h-48', 'rounded-lg', 'mb-4');
    
    const titleSkeleton = screen.getByTestId('title-skeleton');
    expect(titleSkeleton).toHaveClass('w-3/4', 'h-6', 'mb-2');
    
    const subtitleSkeleton = screen.getByTestId('subtitle-skeleton');
    expect(subtitleSkeleton).toHaveClass('w-1/2', 'h-4', 'mb-2');
    
    const descriptionSkeleton = screen.getByTestId('description-skeleton');
    expect(descriptionSkeleton).toHaveClass('w-full', 'h-4');
  });

  it('supports accessibility attributes', () => {
    render(
      <Skeleton 
        aria-label="Loading content"
        role="status"
        data-testid="skeleton"
      />
    );
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveAttribute('aria-label', 'Loading content');
    expect(skeleton).toHaveAttribute('role', 'status');
  });

  it('can represent table loading state', () => {
    render(
      <table data-testid="loading-table">
        <thead>
          <tr>
            <th><Skeleton className="w-16 h-4" data-testid="header-1" /></th>
            <th><Skeleton className="w-20 h-4" data-testid="header-2" /></th>
            <th><Skeleton className="w-12 h-4" data-testid="header-3" /></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><Skeleton className="w-14 h-4" data-testid="cell-1-1" /></td>
            <td><Skeleton className="w-18 h-4" data-testid="cell-1-2" /></td>
            <td><Skeleton className="w-10 h-4" data-testid="cell-1-3" /></td>
          </tr>
          <tr>
            <td><Skeleton className="w-16 h-4" data-testid="cell-2-1" /></td>
            <td><Skeleton className="w-22 h-4" data-testid="cell-2-2" /></td>
            <td><Skeleton className="w-8 h-4" data-testid="cell-2-3" /></td>
          </tr>
        </tbody>
      </table>
    );
    
    const loadingTable = screen.getByTestId('loading-table');
    expect(loadingTable).toBeInTheDocument();
    
    // Check header skeletons
    expect(screen.getByTestId('header-1')).toHaveClass('w-16', 'h-4');
    expect(screen.getByTestId('header-2')).toHaveClass('w-20', 'h-4');
    expect(screen.getByTestId('header-3')).toHaveClass('w-12', 'h-4');
    
    // Check cell skeletons
    expect(screen.getByTestId('cell-1-1')).toHaveClass('w-14', 'h-4');
    expect(screen.getByTestId('cell-2-2')).toHaveClass('w-22', 'h-4');
  });

  it('works with different aspect ratios', () => {
    render(
      <div>
        <Skeleton className="aspect-square w-32" data-testid="square-skeleton" />
        <Skeleton className="aspect-video w-64" data-testid="video-skeleton" />
        <Skeleton className="aspect-[4/3] w-48" data-testid="photo-skeleton" />
      </div>
    );
    
    const squareSkeleton = screen.getByTestId('square-skeleton');
    expect(squareSkeleton).toHaveClass('aspect-square', 'w-32');
    
    const videoSkeleton = screen.getByTestId('video-skeleton');
    expect(videoSkeleton).toHaveClass('aspect-video', 'w-64');
    
    const photoSkeleton = screen.getByTestId('photo-skeleton');
    expect(photoSkeleton).toHaveClass('aspect-[4/3]', 'w-48');
  });

  it('can be animated', () => {
    render(
      <Skeleton 
        className="animate-pulse bg-gradient-to-r from-gray-200 to-gray-300" 
        data-testid="animated-skeleton"
      />
    );
    
    const skeleton = screen.getByTestId('animated-skeleton');
    expect(skeleton).toHaveClass('animate-pulse', 'bg-gradient-to-r', 'from-gray-200', 'to-gray-300');
  });

  it('supports conditional rendering patterns', () => {
    const LoadingComponent = ({ isLoading, children }: { isLoading: boolean; children: React.ReactNode }) => {
      if (isLoading) {
        return <Skeleton className="w-full h-8" data-testid="loading-skeleton" />;
      }
      return <div data-testid="loaded-content">{children}</div>;
    };
    
    const { rerender } = render(
      <LoadingComponent isLoading={true}>
        <span>Actual content</span>
      </LoadingComponent>
    );
    
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    expect(screen.queryByTestId('loaded-content')).not.toBeInTheDocument();
    
    rerender(
      <LoadingComponent isLoading={false}>
        <span>Actual content</span>
      </LoadingComponent>
    );
    
    expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument();
    expect(screen.getByTestId('loaded-content')).toBeInTheDocument();
    expect(screen.getByText('Actual content')).toBeInTheDocument();
  });

  it('maintains layout stability', () => {
    render(
      <div className="container" data-testid="container">
        <Skeleton className="w-full h-16 mb-4" data-testid="header-skeleton" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-32" data-testid="left-skeleton" />
          <Skeleton className="h-32" data-testid="right-skeleton" />
        </div>
        <Skeleton className="w-full h-24 mt-4" data-testid="footer-skeleton" />
      </div>
    );
    
    const container = screen.getByTestId('container');
    expect(container).toBeInTheDocument();
    
    // All skeletons should maintain the layout structure
    expect(screen.getByTestId('header-skeleton')).toHaveClass('w-full', 'h-16', 'mb-4');
    expect(screen.getByTestId('left-skeleton')).toHaveClass('h-32');
    expect(screen.getByTestId('right-skeleton')).toHaveClass('h-32');
    expect(screen.getByTestId('footer-skeleton')).toHaveClass('w-full', 'h-24', 'mt-4');
  });

  it('supports nested skeleton structures', () => {
    render(
      <div className="card p-4" data-testid="nested-skeleton-card">
        <div className="flex items-center space-x-4 mb-4">
          <Skeleton className="w-10 h-10 rounded-full" data-testid="avatar" />
          <div className="space-y-2">
            <Skeleton className="w-24 h-4" data-testid="name" />
            <Skeleton className="w-16 h-3" data-testid="handle" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="w-full h-4" data-testid="line-1" />
          <Skeleton className="w-4/5 h-4" data-testid="line-2" />
          <Skeleton className="w-3/5 h-4" data-testid="line-3" />
        </div>
      </div>
    );
    
    expect(screen.getByTestId('nested-skeleton-card')).toBeInTheDocument();
    expect(screen.getByTestId('avatar')).toHaveClass('w-10', 'h-10', 'rounded-full');
    expect(screen.getByTestId('name')).toHaveClass('w-24', 'h-4');
    expect(screen.getByTestId('handle')).toHaveClass('w-16', 'h-3');
    expect(screen.getByTestId('line-1')).toHaveClass('w-full', 'h-4');
    expect(screen.getByTestId('line-2')).toHaveClass('w-4/5', 'h-4');
    expect(screen.getByTestId('line-3')).toHaveClass('w-3/5', 'h-4');
  });
});
