const { useState, useEffect, useRef } = wp.element;
const { render } = wp.element;
const apiFetch = wp.apiFetch;
const e = wp.element.createElement;

const RegenerateThumbnailsApp = () => {
	const [status, setStatus] = useState('idle');
	const [totalAttachments, setTotalAttachments] = useState(0);
	const [attachmentIds, setAttachmentIds] = useState([]);
	const [processedCount, setProcessedCount] = useState(0);
	const [failedCount, setFailedCount] = useState(0);
	const [completedCount, setCompletedCount] = useState(0);
	const [currentBatchIndex, setCurrentBatchIndex] = useState(0);
	const [results, setResults] = useState({});
	const [errorLog, setErrorLog] = useState([]);
	const [lastError, setLastError] = useState(null);
	const isMountedRef = useRef(true);

	useEffect(() => {
		return () => {
			isMountedRef.current = false;
		};
	}, []);

	const handleStart = async () => {
		setStatus('loading');
		setResults({});
		setErrorLog([]);
		setLastError(null);
		setProcessedCount(0);
		setFailedCount(0);
		setCompletedCount(0);
		setCurrentBatchIndex(0);

		try {
			const response = await apiFetch({
				path: '/wpbomb/v1/regenerate-thumbnails/attachments',
				headers: {
					'X-WP-Nonce': wpBombData.nonce,
				},
			});

			if (!response.success) {
				setLastError('Failed to fetch attachments');
				setStatus('error');
				return;
			}

			if (!isMountedRef.current) return;

			setTotalAttachments(response.total);
			setAttachmentIds(response.attachment_ids);
			setStatus('processing');
			processNextBatch(response.attachment_ids, 0, {});
		} catch (error) {
			if (isMountedRef.current) {
				setLastError(error.message || 'Failed to fetch attachments');
				setStatus('error');
			}
		}
	};

	const processNextBatch = async (allIds, currentIndex, currentResults) => {
		if (!isMountedRef.current) return;

		if (currentIndex >= allIds.length) {
			const failed = Object.values(currentResults).filter(r => !r.success).length;
			const completed = Object.values(currentResults).filter(r => r.success).length;
			
			if (isMountedRef.current) {
				setCompletedCount(completed);
				setFailedCount(failed);
				setStatus('completed');
			}
			return;
		}

		const attachmentId = allIds[currentIndex];

		try {
			const requestData = {
				attachment_id: attachmentId,
			};

			const response = await apiFetch({
				path: '/wpbomb/v1/regenerate-thumbnails/batch',
				method: 'POST',
				headers: {
					'X-WP-Nonce': wpBombData.nonce,
					'Content-Type': 'application/json',
				},
				data: requestData,
			});

			if (!isMountedRef.current) return;

			const resultData = response.result || {
				success: false,
				error: 'No result returned from server',
			};
			const newResults = { ...currentResults, [attachmentId]: resultData };
			const failed = Object.values(newResults).filter(r => !r.success).length;
			const completed = Object.values(newResults).filter(r => r.success).length;
			const processed = Object.keys(newResults).length;

			setResults(newResults);
			setProcessedCount(processed);
			setFailedCount(failed);
			setCompletedCount(completed);
			setCurrentBatchIndex(currentIndex + 1);

			if (!resultData.success) {
				const errorMsg = `ID ${attachmentId}: ${resultData.error || 'Unknown error'}`;
				setErrorLog(prev => [errorMsg, ...prev]);
			}

			processNextBatch(allIds, currentIndex + 1, newResults);
		} catch (error) {
			if (isMountedRef.current) {
				const errorMsg = `ID ${attachmentId} failed: ${error.message || JSON.stringify(error)}`;
				setErrorLog(prev => [errorMsg, ...prev]);
				setLastError(errorMsg);
				setStatus('paused');
			}
		}
	};

	const handleResume = () => {
		if (attachmentIds.length > 0) {
			setStatus('processing');
			setLastError(null);
			processNextBatch(attachmentIds, currentBatchIndex, results);
		}
	};

	const handleReset = () => {
		setStatus('idle');
		setResults({});
		setErrorLog([]);
		setLastError(null);
		setProcessedCount(0);
		setFailedCount(0);
		setCompletedCount(0);
		setCurrentBatchIndex(0);
		setAttachmentIds([]);
		setTotalAttachments(0);
	};

	const progressPercentage = totalAttachments > 0
		? Math.round((processedCount / totalAttachments) * 100)
		: 0;

	return e(
		'div',
		{ className: 'wp-bomb-regenerate-container' },
		status === 'idle' && e(
			'div',
			{ className: 'wp-bomb-controls' },
			e('button', {
				className: 'button button-primary',
				onClick: handleStart,
			}, 'Start Regenerating Thumbnails'),
			e('p', {
				className: 'description',
			}, 'This will delete all cropped thumbnails and regenerate them. The process will run in batches to avoid timeout issues.')
		),
		(status === 'loading' || status === 'processing' || status === 'paused' || status === 'completed') && e(
			'div',
			{ className: 'wp-bomb-progress-section' },
			e(
				'div',
				{ className: 'wp-bomb-progress-bar' },
				e('div', {
					className: 'wp-bomb-progress-fill',
					style: { width: `${progressPercentage}%` },
				})
			),
			e(
				'div',
				{ className: 'wp-bomb-progress-stats' },
				e('span', {
					className: 'progress-text',
				}, `${progressPercentage}% (${processedCount}/${totalAttachments})`)
			),
			e(
				'div',
				{ className: 'wp-bomb-counter' },
				e(
					'div',
					{ className: 'counter-item completed' },
					e('span', { className: 'counter-label' }, 'Completed:'),
					e('span', { className: 'counter-value' }, completedCount.toString())
				),
				e(
					'div',
					{ className: 'counter-item failed' },
					e('span', { className: 'counter-label' }, 'Failed:'),
					e('span', { className: 'counter-value' }, failedCount.toString())
				),
				e(
					'div',
					{ className: 'counter-item pending' },
					e('span', { className: 'counter-label' }, 'Pending:'),
					e('span', { className: 'counter-value' }, (totalAttachments - processedCount).toString())
				)
			),
			lastError && e(
				'div',
				{ className: 'notice notice-error' },
				e('p', null, e('strong', null, 'Error: '), lastError)
			),
			errorLog.length > 0 && e(
				'div',
				{ className: 'wp-bomb-error-log' },
				e('h4', null, 'Error Log'),
				e(
					'div',
					{ className: 'error-list' },
					errorLog.slice(0, 10).map((error, idx) =>
						e('div', {
							key: idx,
							className: 'error-item',
						}, error)
					),
					errorLog.length > 10 && e(
						'div',
						{ className: 'error-item' },
						`... and ${errorLog.length - 10} more errors`
					)
				)
			),
			e(
				'div',
				{ className: 'wp-bomb-actions' },
				status === 'paused' && e('button', {
					className: 'button button-primary',
					onClick: handleResume,
				}, 'Resume'),
				e('button', {
					className: 'button',
					onClick: handleReset,
				}, 'Reset')
			),
			status === 'processing' && e(
				'p',
				{ className: 'status-message' },
				e('em', null, `Processing batch ${currentBatchIndex + 1}...`)
			),
			status === 'completed' && e(
				'div',
				{ className: 'notice notice-success' },
				e('p', null,
					e('strong', null, 'Completed! '),
					`Successfully regenerated thumbnails for ${completedCount} images.`,
					failedCount > 0 && ` ${failedCount} images failed.`
				)
			)
		),
		status === 'error' && e(
			'div',
			{ className: 'notice notice-error' },
			e('p', null, e('strong', null, 'Error: '), lastError),
			e('button', {
				className: 'button',
				onClick: handleReset,
			}, 'Try Again')
		)
	);
};

document.addEventListener('DOMContentLoaded', () => {
	const root = document.getElementById('wp-bomb-regenerate-thumbnails-root');
	if (root) {
		render(e(RegenerateThumbnailsApp), root);
	}
});
