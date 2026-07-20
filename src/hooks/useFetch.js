import { useEffect, useState } from 'react';

export default function useFetch(loader, dependencies = []) {
  const [state, setState] = useState({ data: null, loading: true, error: '' });

  useEffect(() => {
    let active = true;
    loader()
      .then((data) => active && setState({ data, loading: false, error: '' }))
      .catch((error) => active && setState({ data: null, loading: false, error: error.message }));
    return () => { active = false; };
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

  return state;
}
