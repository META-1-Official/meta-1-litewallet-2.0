import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import CircleProgressBar from '../CircleProgressBar';
import TaskSuccess from './TaskSuccess';
import TaskFailed from './TaskFailed';

const HudFaceMagnetProgress = forwardRef(
  (
    props = {
      _canvasWidth: 0,
      _canvasHeight: 0,
    },
    ref,
  ) => {
    const [faceBounds, setFaceBounds] = useState(null);
    const [fillPercent, setFillPercent] = useState(0);
    const [fillColor, setFillColor] = useState('white');
    const [originalWidth, setOriginalWidth] = useState(0);
    const [originalHeight, setOriginalHeight] = useState(0);
    const [canvasWidth, setCanvasWidth] = useState(props._canvasWidth);
    const [canvasHeight, setCanvasHeight] = useState(props._canvasHeight);
    const [data, setData] = useState(null);

    const taskSuccessRef = useRef();
    const taskFailedRef = useRef();

    const backendWidth = 720,
      backendHeight = 480;

    useImperativeHandle(ref, () => ({
      setData,
      setOriginalWidth,
      setOriginalHeight,
      setCanvasWidth,
      setCanvasHeight,
      setTaskState,
    }));

    function translateBbx(bbox) {
      const flippedBbox = {
        top: bbox.top,
        bottom: bbox.bottom,
        left: 1 - bbox.right, // inverted left and right because of flip
        right: 1 - bbox.left, // inverted left and right because of flip
      };

      // Calculate absolute coordinates from the backend.
      const backendBbox = {
        top: flippedBbox.top * backendHeight,
        bottom: flippedBbox.bottom * backendHeight,
        left: flippedBbox.left * backendWidth,
        right: flippedBbox.right * backendWidth,
      };

      // Find the aspect ratio of original feed.
      const originalAspectRatio = originalWidth / originalHeight;

      // Now find which dimension is constrained on frontend (width or height).
      let displayWidth, displayHeight;
      if (canvasWidth / canvasHeight > originalAspectRatio) {
        // Height is constrained dimension.
        displayHeight = canvasHeight;
        displayWidth = canvasHeight * originalAspectRatio;
      } else {
        // Width is constrained dimension.
        displayWidth = canvasWidth;
        displayHeight = canvasWidth / originalAspectRatio;
      }

      // Calculate offset (if any due to centering the feed on canvas).
      const offsetX = (canvasWidth - displayWidth) / 2;
      const offsetY = (canvasHeight - displayHeight) / 2;

      // Scaling factor between backend processed image and display size.
      const xScale = displayWidth / backendWidth;
      const yScale = displayHeight / backendHeight;

      // Translate backend bbox to frontend canvas coordinates.
      return {
        top: backendBbox.top * yScale + offsetY,
        bottom: backendBbox.bottom * yScale + offsetY,
        left: backendBbox.left * xScale + offsetX,
        right: backendBbox.right * xScale + offsetX,
      };
    }

    function getFillColor(percentage) {
      // Ensure percentage is between 0 and 100
      const clampedPercentage = Math.min(100, Math.max(0, percentage));

      // Calculate the RGB values based on the percentage
      const red =
        clampedPercentage > 50
          ? 255 - ((clampedPercentage - 50) * 2 * 255) / 100
          : 255;
      const green =
        clampedPercentage < 50 ? (clampedPercentage * 2 * 255) / 100 : 255;

      // Return the RGB color string
      return `rgb(${Math.round(red)}, ${Math.round(green)}, 0)`;
    }

    function setTaskState(taskState) {
      if (taskState) {
        console.log('Task state');
        if (taskState === 'successful') {
          taskSuccessRef.current.animate(
            faceBounds.centerX,
            faceBounds.centerY,
            faceBounds.radius,
          );
        } else if (taskState === 'failed' || taskState === 'timeout') {
          taskFailedRef.current.animate(
            faceBounds.centerX,
            faceBounds.centerY,
            faceBounds.radius,
          );
        }
      }
    }

    useEffect(() => {
      if (!data || !data.face_bounds) {
        if (
          typeof canvasWidth === 'undefined' ||
          canvasWidth < 50 ||
          typeof canvasHeight === 'undefined' ||
          canvasHeight < 50
        )
          return;

        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;

        setFillPercent(0);

        setFillColor('white');
        setFaceBounds({ centerX, centerY, radius: 50 });
      } else {
        const { bottom, left, right, top } = translateBbx(data.face_bounds);
        console.log('Translated BBX', bottom, top, right, left);
        const width = (right - left) * 1.4;
        const height = (bottom - top) * 1.4;
        const radius = Math.sqrt(width ** 2 + height ** 2) / 2;
        const centerX = (left + right) / 2;
        const centerY = (top - top * 0.15 + (bottom - bottom * 0.15)) / 2;

        setFaceBounds({ centerX, centerY, radius });

        if (data.face_liveliness || data.registration) {
          let subPipelines;
          if (data.face_liveliness)
            subPipelines = Object.values(data.face_liveliness.tasks);

          if (data.registration)
            subPipelines = Object.values(data.registration.tasks);

          const lastPipeline = subPipelines[subPipelines.length - 1];

          const percentage =
            (lastPipeline.current_score / lastPipeline.target_score) * 100;
          setFillPercent(percentage);

          setFillColor(getFillColor(percentage));
        } else {
          setFillColor('white');
        }
      }
    }, [data, canvasWidth, canvasHeight]);

    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <TaskSuccess ref={taskSuccessRef}></TaskSuccess>
        <TaskFailed ref={taskFailedRef}></TaskFailed>
        {faceBounds && (
          <CircleProgressBar
            // width={faceBounds.radius * 2}
            // height={faceBounds.radius * 2}
            width={canvasWidth}
            height={canvasHeight}
            cx={faceBounds.centerX}
            cy={faceBounds.centerY}
            radius={faceBounds.radius}
            progress={fillPercent / 100}
            backgroundLineColor="white"
            progressLineColor={fillColor}
            backgroundLineSize={2}
            progressLineSize={4}
            backgroundLineLength={10}
            progressLineLength={16}
            progressLineSpacing={3}
            // backgroundLineSize={"2"}
            // progressLineSize={"8"}
            // backgroundLineLength={"4"}
            // progressLineLength={"4"}
            // progressLineSpacing={"4"}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        )}
      </div>
    );
  },
);
export default HudFaceMagnetProgress;
