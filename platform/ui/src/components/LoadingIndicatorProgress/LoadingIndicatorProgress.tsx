import React from 'react';
import classNames from 'classnames';

import Icon from '../Icon';
import ProgressLoadingBar from '../ProgressLoadingBar';

/**
 *  A React component that renders a loading indicator.
 * if progress is not provided, it will render an infinite loading indicator
 * if progress is provided, it will render a progress bar
 * Optionally a textBlock can be provided to display a message
 */
function LoadingIndicatorProgress({ className, textBlock, progress }) {
  return (
    <div
      className={classNames(
        'absolute z-50 top-0 left-0 flex flex-col items-center justify-center space-y-5',
        className
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="34"
        height="34"
        viewBox="0 0 34 34"
        fill="none"
      >
        <path
          d="M0 0C4.50868 -1.97081e-07 8.8327 1.79107 12.0208 4.97918C15.2089 8.1673 17 12.4913 17 17C17 21.5087 15.2089 25.8327 12.0208 29.0208C8.8327 32.2089 4.50868 34 2.02656e-06 34L0 0Z"
          fill="#36BCBA"
        />
        <path
          d="M34 34C29.4913 34 25.1673 32.2089 21.9792 29.0208C18.7911 25.8327 17 21.5087 17 17C17 12.4913 18.7911 8.1673 21.9792 4.97918C25.1673 1.79106 29.4913 -8.42088e-07 34 0L34 34Z"
          fill="#ECD171"
        />
      </svg>
      {/* <Icon name="loading-ohif-mark" className="text-white w-12 h-12" /> */}

      <div className="w-48">
        <ProgressLoadingBar progress={progress} />
      </div>
      {textBlock}
    </div>
  );
}

export default LoadingIndicatorProgress;
