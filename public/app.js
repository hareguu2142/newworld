const { Canvas, useFrame } = ReactThreeFiber;
const { Box } = drei;

function Dice() {
  const meshRef = React.useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <Box ref={meshRef} args={[2, 2, 2]}>
      <meshStandardMaterial attach="material" color="white" />
    </Box>
  );
}

function Scene() {
  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <Dice />
    </Canvas>
  );
}

ReactDOM.render(<Scene />, document.getElementById('root'));