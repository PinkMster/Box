import React, { useRef, useEffect } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import PropTypes from 'prop-types';

function Box({ dimensions, ...props }) {
  const group = useRef();
  const { nodes, materials, animations } = useGLTF('/Box/models/box.glb');
  console.log("nodes:", nodes);
  console.log("materials:", materials);
  const { actions } = useAnimations(animations, group);
  const { width, depth, height } = dimensions;

  useEffect(() => {
    if (actions && actions['LidAction']) {
      actions['LidAction'].play();
    }
  }, [actions]);

  return (
    <group ref={group} {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cube.geometry}
        material={materials.Material}
        scale={[width / 10, height / 10, depth / 10]}
      />
    </group>
  );
}

Box.propTypes = {
  dimensions: PropTypes.shape({
    width: PropTypes.number.isRequired,
    depth: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  }).isRequired,
};

export default Box;