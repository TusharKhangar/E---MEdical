import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Pager from './Pager';

describe('Pager', () => {
  it('shows the range and moves between pages', () => {
    const onPage = vi.fn();
    render(<Pager page={{ page: 1, size: 20, totalElements: 45, totalPages: 3 }} onPage={onPage} />);
    expect(screen.getByText('21–40 of 45')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Next page'));
    fireEvent.click(screen.getByLabelText('Previous page'));
    expect(onPage.mock.calls).toEqual([[2], [0]]);
  });

  it('disables next on the last page and hides when empty', () => {
    const { rerender, container } = render(
      <Pager page={{ page: 2, size: 20, totalElements: 45, totalPages: 3 }} onPage={() => {}} />
    );
    expect(screen.getByLabelText('Next page')).toBeDisabled();
    rerender(<Pager page={{ page: 0, size: 20, totalElements: 0, totalPages: 0 }} onPage={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });
});
