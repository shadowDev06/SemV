import { useState } from 'react';

const students = [
  { id: 1, name: 'Rahul', course: 'BCA' },
  { id: 2, name: 'Priya', course: 'BSc IT' },
];

function Student({ name, course }) {
  return (
    <article className="student">
      <h3>{name}</h3>
      <p>Course: {course}</p>
    </article>
  );
}

export default function App() {
  const [name, setName] = useState('');
  const [count, setCount] = useState(0);

  function handleSubmit(event) {
    event.preventDefault();

    if (name.trim()) {
      window.alert('Hello ' + name.trim());
    }
  }

  return (
    <main className="container">
      <h1>React Fundamentals</h1>

      <h2>Components and Props</h2>
      {students.map((student) => (
        <Student key={student.id} name={student.name} course={student.course} />
      ))}

      <h2>State and Events</h2>
      <p>Count: {count}</p>
      <button type="button" onClick={() => setCount((current) => current + 1)}>
        Increase
      </button>

      <h2>Form</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
        <button type="submit">Submit</button>
      </form>
    </main>
  );
}
