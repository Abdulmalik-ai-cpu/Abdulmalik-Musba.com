import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { PUBLICATION_TYPES } from '@portfolio/utils';
import { api } from '@/lib/api';
import { EntityManager } from './entity-manager';

// The portal never touches a real API in these tests: every admin namespace the
// component can reach is a stub, so no request leaves the process.
vi.mock('@/lib/api', () => {
  const manager = () => ({ list: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() });
  return {
    api: {
      admin: {
        projects: manager(),
        publications: manager(),
        socialLinks: manager(),
        education: manager(),
      },
    },
    setAuthToken: vi.fn(),
    getAuthToken: vi.fn(() => null),
    API_URL: 'http://localhost:3001/api',
  };
});

interface Manager {
  list: Mock;
  create: Mock;
  update: Mock;
  remove: Mock;
}

const managers = api.admin as unknown as Record<string, Manager>;

function managerFor(entity: string): Manager {
  const key = entity === 'social-links' ? 'socialLinks' : entity;
  const manager = managers[key];
  if (!manager) throw new Error(`No stub registered for the admin namespace "${key}"`);
  return manager;
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

async function renderEntity(entity: string): Promise<Manager> {
  const manager = managerFor(entity);
  manager.list.mockResolvedValue([]);
  render(<EntityManager entity={entity} />);
  await screen.findByText(/Nothing here yet/i);
  return manager;
}

function openCreateForm(label: string) {
  fireEvent.click(screen.getByRole('button', { name: new RegExp(`add ${label}`, 'i') }));
}

function fill(label: RegExp, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

function saveButton(): HTMLButtonElement {
  return screen.getByRole('button', { name: /sav/i }) as HTMLButtonElement;
}

function submit() {
  fireEvent.click(saveButton());
}

function argumentOf(mock: Mock, call = 0): Record<string, unknown> {
  const args = mock.mock.calls[call];
  if (!args) throw new Error(`Expected at least ${call + 1} call(s)`);
  return args[0] as Record<string, unknown>;
}

function payloadOf(manager: Manager, call = 0): Record<string, unknown> {
  return argumentOf(manager.create, call);
}

function httpError(statusCode: number, message: string) {
  return Object.assign(new Error(message), { statusCode });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('EntityManager — saving a record', () => {
  it('submits the form once and shows success feedback', async () => {
    const manager = await renderEntity('projects');
    openCreateForm('projects');
    fill(/^Title/, 'Portfolio platform');
    fill(/^Summary/, 'Public site, admin portal and API');
    manager.create.mockResolvedValue({ id: 'p1', title: 'Portfolio platform' });

    submit();

    const status = await screen.findByRole('status');
    expect(status.textContent).toContain('Projects created.');
    expect(manager.create).toHaveBeenCalledTimes(1);
    // Back on the list, with the new record visible.
    expect(screen.getByRole('heading', { name: 'Projects' })).toBeTruthy();
    expect(screen.getByText('Portfolio platform')).toBeTruthy();
  });

  it('disables the Save button and shows "Saving…" while the request is pending', async () => {
    const manager = await renderEntity('projects');
    openCreateForm('projects');
    fill(/^Title/, 'Portfolio platform');
    fill(/^Summary/, 'Public site, admin portal and API');
    const pending = deferred<{ id: string }>();
    manager.create.mockReturnValue(pending.promise);

    const button = saveButton();
    fireEvent.click(button);

    await waitFor(() => expect(button.disabled).toBe(true));
    expect(button.textContent).toContain('Saving…');
    expect(button.getAttribute('aria-busy')).toBe('true');

    pending.resolve({ id: 'p1' });

    await screen.findByRole('status');
    expect(screen.getByRole('heading', { name: 'Projects' })).toBeTruthy();
  });

  it('sends only one request when Save is clicked repeatedly', async () => {
    const manager = await renderEntity('projects');
    openCreateForm('projects');
    fill(/^Title/, 'Portfolio platform');
    fill(/^Summary/, 'Public site, admin portal and API');
    const pending = deferred<{ id: string; title: string }>();
    manager.create.mockReturnValue(pending.promise);

    const button = saveButton();
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    expect(manager.create).toHaveBeenCalledTimes(1);

    pending.resolve({ id: 'p1', title: 'Portfolio platform' });
    await screen.findByRole('status');

    expect(manager.create).toHaveBeenCalledTimes(1);
    expect(screen.getAllByText('Portfolio platform')).toHaveLength(1);
  });

  it('guards against two clicks dispatched in the same batch', async () => {
    const manager = await renderEntity('projects');
    openCreateForm('projects');
    fill(/^Title/, 'Portfolio platform');
    fill(/^Summary/, 'Public site, admin portal and API');
    const pending = deferred<{ id: string }>();
    manager.create.mockReturnValue(pending.promise);

    // Both clicks land before React can re-render the disabled button, so only
    // the in-flight guard can prevent the second request.
    const button = saveButton();
    act(() => {
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(manager.create).toHaveBeenCalledTimes(1);

    pending.resolve({ id: 'p1' });
    await screen.findByRole('status');
    expect(manager.create).toHaveBeenCalledTimes(1);
  });

  it('shows a readable error, keeps the input, and allows a retry', async () => {
    const manager = await renderEntity('projects');
    openCreateForm('projects');
    fill(/^Title/, 'Portfolio platform');
    fill(/^Summary/, 'Public site, admin portal and API');
    manager.create
      .mockRejectedValueOnce(httpError(400, 'repositoryUrl: Invalid url'))
      .mockResolvedValueOnce({ id: 'p1', title: 'Portfolio platform' });

    submit();

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toBe(
      'The server rejected the submitted values: repositoryUrl: Invalid url.',
    );
    expect(screen.getAllByRole('alert')).toHaveLength(1);
    expect(document.body.textContent).not.toContain('Is the API running');

    // The form is still open and still holds what the user typed.
    expect(screen.getByRole('heading', { name: /new projects/i })).toBeTruthy();
    expect((screen.getByLabelText(/^Title/) as HTMLInputElement).value).toBe('Portfolio platform');
    expect((screen.getByLabelText(/^Summary/) as HTMLTextAreaElement).value).toBe(
      'Public site, admin portal and API',
    );

    // Loading state ended, so the button is usable again.
    expect(saveButton().disabled).toBe(false);
    expect(saveButton().textContent).toContain('Save');

    submit();

    const status = await screen.findByRole('status');
    expect(status.textContent).toContain('Projects created.');
    expect(manager.create).toHaveBeenCalledTimes(2);
  });

  it('reports an expired session and a server error distinctly', async () => {
    const manager = await renderEntity('projects');
    openCreateForm('projects');
    fill(/^Title/, 'Portfolio platform');
    fill(/^Summary/, 'Public site, admin portal and API');

    manager.create.mockRejectedValueOnce(httpError(401, 'Unauthorized'));
    submit();
    expect((await screen.findByRole('alert')).textContent).toBe(
      'Your session has expired. Sign in again and retry.',
    );

    manager.create.mockRejectedValueOnce(httpError(500, 'Internal server error'));
    submit();
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('server error (500)');
    expect(alert.textContent).toContain('not a connection problem');
  });

  it('reports an unreachable API as a connection problem', async () => {
    const manager = await renderEntity('projects');
    openCreateForm('projects');
    fill(/^Title/, 'Portfolio platform');
    fill(/^Summary/, 'Public site, admin portal and API');
    manager.create.mockRejectedValue(new TypeError('Failed to fetch'));

    submit();

    expect((await screen.findByRole('alert')).textContent).toBe(
      'Could not reach the API. Check your connection and try again.',
    );
  });

  it('disables Back and Cancel while saving', async () => {
    const manager = await renderEntity('projects');
    openCreateForm('projects');
    fill(/^Title/, 'Portfolio platform');
    fill(/^Summary/, 'Public site, admin portal and API');
    const pending = deferred<{ id: string }>();
    manager.create.mockReturnValue(pending.promise);

    submit();

    const cancel = screen.getByRole('button', { name: /^cancel$/i }) as HTMLButtonElement;
    const back = screen.getByRole('button', { name: /back/i }) as HTMLButtonElement;
    await waitFor(() => expect(cancel.disabled).toBe(true));
    expect(back.disabled).toBe(true);

    pending.resolve({ id: 'p1' });
    await screen.findByRole('status');
  });

  it('Cancel returns to the list when nothing is being saved', async () => {
    await renderEntity('projects');
    openCreateForm('projects');
    fill(/^Title/, 'Abandoned');

    fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }));

    expect(screen.getByRole('heading', { name: 'Projects' })).toBeTruthy();
    expect(screen.queryByLabelText(/^Title/)).toBeNull();
  });

  it('updates an existing record through the same guarded save path', async () => {
    const manager = managerFor('projects');
    manager.list.mockResolvedValue([
      {
        id: 'p1',
        title: 'Old title',
        summary: 'Old summary',
        status: null,
        repositoryUrl: null,
        liveUrl: null,
        imageUrl: null,
        featured: false,
      },
    ]);
    render(<EntityManager entity="projects" />);
    await screen.findByText('Old title');

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    expect((screen.getByLabelText(/^Title/) as HTMLInputElement).value).toBe('Old title');

    fill(/^Title/, 'New title');
    manager.update.mockResolvedValue({ id: 'p1', title: 'New title' });

    submit();

    const status = await screen.findByRole('status');
    expect(status.textContent).toContain('Projects updated.');
    expect(manager.update).toHaveBeenCalledTimes(1);
    expect(argumentOf(manager.update)).toBe('p1');
    expect(manager.create).not.toHaveBeenCalled();
    expect(screen.getByText('New title')).toBeTruthy();
  });
});

describe('EntityManager — payload normalisation', () => {
  it('turns blank optional values into null, never the string "undefined"', async () => {
    const manager = await renderEntity('projects');
    openCreateForm('projects');
    fill(/^Title/, 'Portfolio platform');
    fill(/^Summary/, 'Public site, admin portal and API');
    manager.create.mockResolvedValue({ id: 'p1' });

    submit();
    await screen.findByRole('status');

    expect(payloadOf(manager)).toEqual({
      title: 'Portfolio platform',
      summary: 'Public site, admin portal and API',
      status: null,
      repositoryUrl: null,
      liveUrl: null,
      imageUrl: null,
      featured: false,
    });
    expect(JSON.stringify(payloadOf(manager))).not.toContain('"undefined"');
  });

  it('keeps a URL the user actually typed', async () => {
    const manager = await renderEntity('projects');
    openCreateForm('projects');
    fill(/^Title/, 'Portfolio platform');
    fill(/^Summary/, 'Public site, admin portal and API');
    fill(/^Repository URL/, 'https://github.com/Abdulmalik-ai-cpu/Abdulmalik-Musba.com');
    manager.create.mockResolvedValue({ id: 'p1' });

    submit();
    await screen.findByRole('status');

    expect(payloadOf(manager).repositoryUrl).toBe(
      'https://github.com/Abdulmalik-ai-cpu/Abdulmalik-Musba.com',
    );
  });

  it('omits a blank order for social links instead of sending null', async () => {
    const manager = await renderEntity('social-links');
    openCreateForm('social links');
    fill(/^Platform/, 'GitHub');
    fill(/^Label/, 'GitHub');
    fill(/^URL/, 'https://github.com/Abdulmalik-ai-cpu');
    manager.create.mockResolvedValue({ id: 's1' });

    submit();
    await screen.findByRole('status');

    const payload = payloadOf(manager);
    expect(payload).not.toHaveProperty('sortOrder');
    expect(payload.url).toBe('https://github.com/Abdulmalik-ai-cpu');
    expect(payload.icon).toBeNull();
  });
});

describe('EntityManager — publication type', () => {
  it('offers exactly the enum values the API accepts and defaults to OTHER', async () => {
    const manager = await renderEntity('publications');
    openCreateForm('publications');

    const select = screen.getByLabelText(/^Type/) as HTMLSelectElement;
    expect(select.value).toBe('OTHER');
    expect(Array.from(select.options).map((option) => option.value)).toEqual([
      ...PUBLICATION_TYPES,
    ]);

    fill(/^Title/, 'A paper');
    manager.create.mockResolvedValue({ id: 'pub1' });
    submit();
    await screen.findByRole('status');

    expect(payloadOf(manager).type).toBe('OTHER');
  });

  it('submits the type the user picks', async () => {
    const manager = await renderEntity('publications');
    openCreateForm('publications');
    fill(/^Title/, 'A paper');
    fireEvent.change(screen.getByLabelText(/^Type/), { target: { value: 'JOURNAL' } });
    manager.create.mockResolvedValue({ id: 'pub1' });

    submit();
    await screen.findByRole('status');

    expect(payloadOf(manager).type).toBe('JOURNAL');
  });
});

describe('EntityManager — load errors', () => {
  it('reports a server error instead of claiming the API is not running', async () => {
    const manager = managerFor('projects');
    manager.list.mockRejectedValue(httpError(500, 'Internal server error'));

    render(<EntityManager entity="projects" />);

    const message = await screen.findByText(/server error \(500\)/);
    expect(message.textContent).toContain('not a connection problem');
    expect(document.body.textContent).not.toContain('Is the API running');
  });

  it('reports an unreachable API as a connection problem', async () => {
    const manager = managerFor('projects');
    manager.list.mockRejectedValue(new TypeError('Failed to fetch'));

    render(<EntityManager entity="projects" />);

    const message = await screen.findByText(/Could not reach the API/);
    expect(message.textContent).toContain('Check your connection');
  });

  it('exposes a list-view load error through role="alert"', async () => {
    const manager = managerFor('projects');
    manager.list.mockRejectedValue(httpError(500, 'Internal server error'));

    render(<EntityManager entity="projects" />);

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('server error (500)');
    expect(screen.getAllByRole('alert')).toHaveLength(1);
  });
});
