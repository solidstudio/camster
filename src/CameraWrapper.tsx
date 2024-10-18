import React, { Suspense } from 'react';

const Camera = React.lazy(() => import('./Camera'));

const CameraWrapper = () => {
  return (
    <div>
      <Suspense fallback={<div>loading</div>}>
        {<Camera />}
      </Suspense>
    </div>
  );
};

export default CameraWrapper;