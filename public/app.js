function Counter() {
  const [count, setCount] = React.useState(0);

  const increment = () = {
    setCount(prevCount = prevCount + 1);
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Simple Counter</h1>
      <p>Count: {count}</p>
      <button onClick={increment} style={{ fontSize: '18px', padding: '10px 20px' }}>
        Increment
      </button>
    </div>
  );
}

ReactDOM.render(<Counter />, document.getElementById('root'));
