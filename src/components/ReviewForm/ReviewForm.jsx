import { useState } from 'react';

const MAX_NAME = 50;
const MAX_COMMENT = 500;

export default function ReviewForm({ onAdd }) {
  const [form, setForm] = useState({ name: '', rating: '5', comment: '' });
  const [errors, setErrors] = useState({});

  function submit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Please enter your name.';
    if (form.name.trim().length > MAX_NAME) nextErrors.name = `Use ${MAX_NAME} characters or fewer.`;
    if (!form.comment.trim()) nextErrors.comment = 'Please share a few thoughts.';
    if (form.comment.trim().length > MAX_COMMENT) nextErrors.comment = `Use ${MAX_COMMENT} characters or fewer.`;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onAdd({ id: crypto.randomUUID(), reviewerName: form.name.trim(), rating: Number(form.rating), comment: form.comment.trim(), date: new Date().toISOString() });
    setForm({ name: '', rating: '5', comment: '' });
  }

  return (
    <form className="review-form" onSubmit={submit} noValidate>
      <div className="field-row">
        <label>Your name<input value={form.name} maxLength={MAX_NAME + 1} aria-invalid={!!errors.name} aria-describedby="name-error" onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Alex Morgan" /></label>
        <label>Rating<select value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })}>{[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} — {value === 5 ? 'Excellent' : value === 4 ? 'Good' : value === 3 ? 'Average' : value === 2 ? 'Fair' : 'Poor'}</option>)}</select></label>
      </div>
      {errors.name && <p className="field-error" id="name-error">{errors.name}</p>}
      <label>Your review<textarea value={form.comment} maxLength={MAX_COMMENT + 1} aria-invalid={!!errors.comment} aria-describedby="comment-error comment-count" onChange={(e) => setForm({ ...form, comment: e.target.value })} placeholder="What stood out to you?" rows="5" /></label>
      <div className="form-bottom"><span id="comment-count">{form.comment.length}/{MAX_COMMENT}</span><button className="button" type="submit">Publish review</button></div>
      {errors.comment && <p className="field-error" id="comment-error">{errors.comment}</p>}
    </form>
  );
}
