import React, { useRef, useEffect } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import PropTypes from 'prop-types';

function Box({ dimensions, ...props }) {
  const group = useRef();
  const { nodes, materials, animations } = useGLTF('/models/box.glb');
  console.log("nodes:", nodes); // nodes 객체 확인
  console.log("materials:", materials); // materials 객체 확인
  const { actions } = useAnimations(animations, group);
  const { width, depth, height } = dimensions;

  useEffect(() => {
    if (actions && actions['LidAction']) {
      actions['LidAction'].play();
    }
  }, [actions]);

  return (
    <group ref={group} {...props} dispose={null}>
      {/* 박스 렌더링 */}
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cube.geometry} // Cube 메시 사용
        material={materials.Material} // Material 재질 사용
        scale={[width / 100, height / 100, depth / 100]}
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