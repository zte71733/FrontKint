const BASE_URL = ''; // Relative to origin because of Vite proxy

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('kint_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (response.status === 401) {
    localStorage.removeItem('kint_token');
    try {
      window.dispatchEvent(new CustomEvent('unauthorized'));
    } catch {
      // Fallback for environments where CustomEvent might fail as a constructor
      const event = document.createEvent('Event');
      event.initEvent('unauthorized', true, true);
      window.dispatchEvent(event);
    }
  }

  const contentType = response.headers.get('content-type');
  let data;
  
  if (contentType && contentType.includes('application/json')) {
    const text = await response.text();
    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      console.error('Failed to parse JSON response:', text, e);
      data = { message: 'Invalid server response format' };
    }
  } else {
    try {
      const text = await response.text();
      data = { message: text || `Request failed with status ${response.status}` };
    } catch {
      data = { message: `Request failed with status ${response.status}` };
    }
  }

  if (!response.ok) {
    const errorMsg = data.message || data.error || `Error ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  get: (url, options) => apiFetch(url, { ...options, method: 'GET' }),
  post: (url, body, options) => apiFetch(url, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: (url, body, options) => apiFetch(url, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  delete: (url, options) => apiFetch(url, { ...options, method: 'DELETE' }),
};
