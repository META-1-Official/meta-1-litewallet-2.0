import React, {useEffect, useRef} from 'react';

const CircleProgressBar = ({
	width,
	height,
	cx, // Adjusted: Adding cx prop
	cy, // Adjusted: Adding cy prop
	radius,
	progress,
	backgroundLineColor,
	progressLineColor,
	backgroundLineSize,
	progressLineSize,
	backgroundLineLength,
	progressLineLength,
	progressLineSpacing,
	style,
}) => {
	const canvasRef = useRef(null);

	const animationRef = useRef(null);
	const prevValuesRef = useRef({
		cx: 0,
		cy: 0,
		radius: 0,
		progress: 0,
	});
	const isFirstRender = useRef(true);

	const animate = (startTimestamp, duration, newValues) => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		if (!startTimestamp) startTimestamp = performance.now();

		const animateFrame = (timestamp) => {
			const elapsed = timestamp - startTimestamp;
			const fraction = Math.min(elapsed / duration, 1);

			// Interpolate values
			const interpolated = {
				cx: interpolate(prevValuesRef.current.cx, newValues.cx, fraction),
				cy: interpolate(prevValuesRef.current.cy, newValues.cy, fraction),
				radius: interpolate(
					prevValuesRef.current.radius,
					newValues.radius,
					fraction
				),
				progress: interpolate(
					prevValuesRef.current.progress,
					newValues.progress,
					fraction
				),
			};

			const ctx = canvas.getContext('2d');
			if (!ctx) return;

			ctx.imageSmoothingEnabled = true;
			// ctx.scale(scaleFactor, scaleFactor);

			// Adjusted: use cx and cy
			const centerX = interpolated.cx || width / 2;
			const centerY = interpolated.cy || height / 2;

			const radius1 = Math.max(
				Math.min(Math.min(width, height) / 2, interpolated.radius),
				200
			);
			const radius2 = radius1 + 5;

			// console.log("Radius", Math.min(width, height) / 2, interpolated.radius)

			ctx.clearRect(0, 0, canvas.width, canvas.height);

			ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			ctx.globalCompositeOperation = 'destination-out';
			ctx.arc(centerX, centerY, radius1 - progressLineLength, 0, 2 * Math.PI);
			ctx.fill();
			ctx.globalCompositeOperation = 'source-over';

			for (
				let angle = 0;
				angle < 2 * Math.PI;
				angle += (Math.PI / 180) * progressLineSpacing
			) {
				ctx.beginPath();
				const startX1 =
					centerX + (radius1 - backgroundLineSize / 2) * Math.cos(angle);
				const startY1 =
					centerY + (radius1 - backgroundLineSize / 2) * Math.sin(angle);
				const endX1 =
					centerX +
					(radius1 - backgroundLineSize / 2 - backgroundLineLength) *
						Math.cos(angle);
				const endY1 =
					centerY +
					(radius1 - backgroundLineSize / 2 - backgroundLineLength) *
						Math.sin(angle);
				ctx.moveTo(startX1, startY1);
				ctx.lineTo(endX1, endY1);

				ctx.strokeStyle = backgroundLineColor;
				ctx.lineWidth = backgroundLineSize;
				ctx.stroke();
				ctx.closePath();
			}

			for (
				let angle = 0;
				angle < 2 * Math.PI;
				angle += (Math.PI / 180) * progressLineSpacing
			) {
				if (angle < 2 * Math.PI * interpolated.progress) {
					ctx.beginPath();
					const startX2 =
						centerX + (radius2 - progressLineSize / 2) * Math.cos(angle);
					const startY2 =
						centerY + (radius2 - progressLineSize / 2) * Math.sin(angle);
					const endX2 =
						centerX +
						(radius2 - progressLineSize / 2 - progressLineLength) *
							Math.cos(angle);
					const endY2 =
						centerY +
						(radius2 - progressLineSize / 2 - progressLineLength) *
							Math.sin(angle);
					ctx.moveTo(startX2, startY2);
					ctx.lineTo(endX2, endY2);

					ctx.strokeStyle = progressLineColor;
					ctx.lineWidth = progressLineSize;
					ctx.stroke();
					ctx.closePath();
				}
			}

			if (fraction < 1) {
				animationRef.current = requestAnimationFrame(animateFrame);
			} else {
				// Update prevValuesRef to newValues for the next animation
				prevValuesRef.current = newValues;
			}
		};

		animationRef.current = requestAnimationFrame(animateFrame);
	};

	const interpolate = (start, end, fraction) => {
		return start + (end - start) * fraction;
	};

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const newValues = {
			cx: cx,
			cy: cy,
			radius: radius,
			progress: progress,
		};

		// console.log("CPB", newValues)

		if (isFirstRender.current) {
			// Directly set the values without animation on initial render
			prevValuesRef.current = newValues;
			isFirstRender.current = false;
		}

		// Cancel any ongoing animation
		if (animationRef.current) {
			cancelAnimationFrame(animationRef.current);
		}

		// Start new animation
		animate(null, 250, newValues); // 300ms duration for example
	}, [
		width,
		height,
		cx, // Adjusted: Adding cx as dependency
		cy, // Adjusted: Adding cy as dependency
		progress,
		backgroundLineColor,
		progressLineColor,
		backgroundLineSize,
		progressLineSize,
		backgroundLineLength,
		progressLineLength,
		progressLineSpacing,
	]);

	return (
		<canvas
			ref={canvasRef}
			width={width}
			height={height}
			style={style}
		></canvas>
	);
};

export default CircleProgressBar;
