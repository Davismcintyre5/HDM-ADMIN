import { useState, useCallback } from 'react';

export function useForm(initialValues = {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setValues(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setErrors(prev => { if (prev[name]) { const u = { ...prev }; delete u[name]; return u; } return prev; });
  }, []);

  const handleBlur = useCallback((e) => setTouched(prev => ({ ...prev, [e.target.name]: true })), []);
  const setFieldValue = useCallback((name, value) => setValues(prev => ({ ...prev, [name]: value })), []);
  const resetForm = useCallback((newValues = initialValues) => { setValues(newValues); setErrors({}); setTouched({}); }, [initialValues]);

  return { values, errors, touched, handleChange, handleBlur, setFieldValue, resetForm, setValues };
}