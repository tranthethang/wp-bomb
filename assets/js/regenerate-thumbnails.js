const { useState, useEffect, useRef, useCallback } = wp.element;
const { render } = wp.element;
const apiFetch = wp.apiFetch;
const e = wp.element.createElement;

const RegenerateThumbnailsApp = () => {
	const BATCH_SIZE = wpBombData.batch_size || 8;
	const UPDATE_DEBOUNCE_MS = 100;

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
	const debounceTimerRef = useRef(null);
	const pendingUpdatesRef = useRef({});

	useEffect(() => {
		return () => {
			isMountedRef.current = false;
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}
		};
	}, []);

	const debouncedStateUpdate = useCallback((updates) => {
		Object.assign(pendingUpdatesRef.current, updates);

		if (debounceTimerRef.current) {
			clearTimeout(debounceTimerRef.current);
		}

		debounceTimerRef.current = setTimeout(() => {
			if (!isMountedRef.current) return;

			const updates = pendingUpdatesRef.current;
			pendingUpdatesRef.current = {};

			if (updates.status !== undefined) setStatus(updates.status);
			if (updates.processedCount !== undefined) setProcessedCount(updates.processedCount);
			if (updates.failedCount !== undefined) setFailedCount(updates.failedCount);
			if (updates.completedCount !== undefined) setCompletedCount(updates.completedCount);
			if (updates.currentBatchIndex !== undefined) setCurrentBatchIndex(updates.currentBatchIndex);
			if (updates.results !== undefined) setResults(updates.results);
			if (updates.lastError !== undefined) setLastError(updates.lastError);
			if (updates.errorLog !== undefined) setErrorLog(updates.errorLog);
		}, UPDATE_DEBOUNCE_MS);
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
			processBatches(response.attachment_ids, 0, {});
		} catch (error) {
			if (isMountedRef.current) {
				setLastError(error.message || 'Failed to fetch attachments');
				setStatus('error');
			}
		}
	};

	const processBatches = async (allIds, currentIndex, currentResults) => {
		if (!isMountedRef.current) return;

		if (currentIndex >= allIds.length) {
			const failed = Object.values(currentResults).filter(r => !r.success).length;
			const completed = Object.values(currentResults).filter(r => r.success).length;

			debouncedStateUpdate({
				completedCount: completed,
				failedCount: failed,
				status: 'completed',
			});
			return;
		}

		const batchIds = allIds.slice(currentIndex, currentIndex + BATCH_SIZE);

		try {
			const response = await apiFetch({
				path: '/wpbomb/v1/regenerate-thumbnails/batch-process',
				method: 'POST',
				headers: {
					'X-WP-Nonce': wpBombData.nonce,
					'Content-Type': 'application/json',
				},
				data: {
					attachment_ids: batchIds,
				},
			});

			if (!isMountedRef.current) return;

			const batchResults = response.results || {};
			const newResults = { ...currentResults, ...batchResults };

			const failed = Object.values(newResults).filter(r => !r.success).length;
			const completed = Object.values(newResults).filter(r => r.success).length;
			const processed = Object.keys(newResults).length;
			const newErrors = Object.entries(batchResults)
				.filter(([_, result]) => !result.success)
				.map(([id, result]) => `ID ${id}: ${result.error || 'Unknown error'}`);

			const updates = {
				results: newResults,
				processedCount: processed,
				failedCount: failed,
				completedCount: completed,
				currentBatchIndex: currentIndex + BATCH_SIZE,
			};

			if (newErrors.length > 0) {
				setErrorLog(prev => [...newErrors, ...prev]);
			}

			debouncedStateUpdate(updates);

			await new Promise(resolve => setTimeout(resolve, 50));

			processBatches(allIds, currentIndex + BATCH_SIZE, newResults);
		} catch (error) {
			if (isMountedRef.current) {
				const errorMsg = `Batch failed (IDs ${batchIds[0]}-${batchIds[batchIds.length - 1]}): ${error.message || JSON.stringify(error)}`;
				setErrorLog(prev => [errorMsg, ...prev]);
				debouncedStateUpdate({
					lastError: errorMsg,
					status: 'paused',
				});
			}
		}
	};

	const handleResume = () => {
		if (attachmentIds.length > 0) {
			setStatus('processing');
			setLastError(null);
			processBatches(attachmentIds, currentBatchIndex, results);
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
