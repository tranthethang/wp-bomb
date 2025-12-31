/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./assets/js/components/AutoAttachThumbnail.js"
/*!*****************************************************!*\
  !*** ./assets/js/components/AutoAttachThumbnail.js ***!
  \*****************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/api-fetch */ "@wordpress/api-fetch");
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__);





const AutoAttachThumbnail = () => {
  const [minId, setMinId] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('');
  const [maxId, setMaxId] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('');
  const [isLoading, setIsLoading] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [isFetchingStats, setIsFetchingStats] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(true);
  const [notice, setNotice] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    fetchStats();
  }, []);
  const fetchStats = async () => {
    try {
      const data = await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_3___default()({
        path: '/wpbomb/v1/auto-attach-thumbnail/stats'
      });
      if (data.success) {
        setMinId(data.min_id);
        setMaxId(data.max_id);
      }
    } catch (error) {
      console.error('Failed to fetch stats', error);
    } finally {
      setIsFetchingStats(false);
    }
  };
  const handleExecute = async e => {
    e.preventDefault();
    if (!confirm((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Are you sure you want to attach thumbnails? This will set thumbnails for posts based on the specified ID range.', 'wp-bomb'))) {
      return;
    }
    setIsLoading(true);
    setNotice(null);
    try {
      const data = await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_3___default()({
        path: '/wpbomb/v1/auto-attach-thumbnail/execute',
        method: 'POST',
        data: {
          min_id: parseInt(minId),
          max_id: parseInt(maxId)
        }
      });
      if (data.success) {
        setNotice({
          type: 'success',
          message: data.message
        });
      }
    } catch (error) {
      setNotice({
        type: 'error',
        message: error.message || (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('An error occurred during execution.', 'wp-bomb')
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "wp-bomb-module mb-8"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "mb-6"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("h2", {
    className: "text-2xl font-medium text-gray-800 mb-2"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Auto Attach Thumbnail', 'wp-bomb')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", {
    className: "text-[13px] text-wp-sub leading-relaxed max-w-4xl"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('This module scans posts within the specified ID range and automatically attaches the first image found in the content as the featured image (thumbnail) if one is not already set.', 'wp-bomb'))), notice && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Notice, {
    status: notice.type,
    onRemove: () => setNotice(null),
    className: "mb-4"
  }, notice.message), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.PanelBody, {
    className: "bg-white border border-wp-border shadow-wp-card rounded-sm overflow-hidden p-0"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("form", {
    onSubmit: handleExecute,
    className: "p-6 md:p-8 space-y-6"
  }, isFetchingStats ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "flex justify-center py-4"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Spinner, null)) : (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "grid grid-cols-1 sm:grid-cols-2 gap-6"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "space-y-2"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.TextControl, {
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Min ID', 'wp-bomb'),
    type: "number",
    value: minId,
    onChange: value => setMinId(value),
    help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Starting post ID for the operation.', 'wp-bomb'),
    required: true,
    min: "0"
  })), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "space-y-2"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.TextControl, {
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Max ID', 'wp-bomb'),
    type: "number",
    value: maxId,
    onChange: value => setMaxId(value),
    help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Ending post ID for the operation.', 'wp-bomb'),
    required: true,
    min: "0"
  }))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "pt-4 flex items-center justify-end border-t border-wp-border"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
    variant: "primary",
    type: "submit",
    isBusy: isLoading,
    disabled: isLoading,
    icon: "controls-play",
    className: "flex items-center gap-2"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Execute', 'wp-bomb'))))));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (AutoAttachThumbnail);

/***/ },

/***/ "./assets/js/components/RegenerateThumbnails.js"
/*!******************************************************!*\
  !*** ./assets/js/components/RegenerateThumbnails.js ***!
  \******************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/api-fetch */ "@wordpress/api-fetch");
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__);





const RegenerateThumbnails = () => {
  const [view, setView] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('settings');
  const [status, setStatus] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('idle');
  const [settings, setSettings] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)({
    batchSize: window.wpBombData?.batch_size || 10,
    selectedSizes: [],
    skipExisting: false
  });
  const [availableSizes, setAvailableSizes] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)({});
  const [isLoadingSizes, setIsLoadingSizes] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(true);
  const [notice, setNotice] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [stats, setStats] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)({
    total: 0,
    processed: 0,
    completed: 0,
    failed: 0,
    pending: 0,
    percentage: 0,
    startTime: null,
    duration: 0
  });
  const [lastProcessed, setLastProcessed] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('');
  const [attachmentIds, setAttachmentIds] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)([]);
  const isMountedRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useRef)(true);
  const shouldStopRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useRef)(false);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    fetchSizes();
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  const fetchSizes = async () => {
    try {
      const response = await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_3___default()({
        path: '/wpbomb/v1/regenerate-thumbnails/sizes'
      });
      if (isMountedRef.current && response.success) {
        setAvailableSizes(response.sizes);
        setSettings(prev => ({
          ...prev,
          selectedSizes: Object.keys(response.sizes)
        }));
      }
    } catch (error) {
      console.error('Failed to fetch sizes', error);
    } finally {
      setIsLoadingSizes(false);
    }
  };
  const handleStart = async () => {
    shouldStopRef.current = false;
    setStatus('loading');
    setView('progress');
    setNotice(null);
    try {
      const response = await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_3___default()({
        path: '/wpbomb/v1/regenerate-thumbnails/attachments'
      });
      if (!isMountedRef.current) return;
      if (response.success) {
        const ids = response.attachment_ids;
        setAttachmentIds(ids);
        const initialStats = {
          total: response.total,
          processed: 0,
          completed: 0,
          failed: 0,
          pending: response.total,
          percentage: 0,
          startTime: Date.now(),
          duration: 0
        };
        setStats(initialStats);
        setStatus('processing');
        processBatches(ids, 0, {
          completed: 0,
          failed: 0
        }, initialStats.startTime);
      }
    } catch (error) {
      console.error('Failed to start process', error);
      setStatus('error');
      setNotice({
        type: 'error',
        message: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Failed to start the process.', 'wp-bomb')
      });
    }
  };
  const processBatches = async (allIds, currentIndex, currentStats, startTime) => {
    if (!isMountedRef.current || shouldStopRef.current) {
      if (shouldStopRef.current) setStatus('stopped');
      return;
    }
    if (currentIndex >= allIds.length) {
      const endTime = Date.now();
      const duration = Math.round((endTime - startTime) / 1000);
      setStats(prev => ({
        ...prev,
        duration,
        pending: 0,
        percentage: 100
      }));
      setStatus('completed');
      return;
    }
    const batchIds = allIds.slice(currentIndex, currentIndex + settings.batchSize);
    try {
      const response = await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_3___default()({
        path: '/wpbomb/v1/regenerate-thumbnails/batch-process',
        method: 'POST',
        data: {
          attachment_ids: batchIds,
          selected_sizes: settings.selectedSizes,
          skip_existing: settings.skipExisting
        }
      });
      if (!isMountedRef.current || shouldStopRef.current) {
        if (shouldStopRef.current) setStatus('stopped');
        return;
      }
      const results = response.results || {};
      let newCompleted = currentStats.completed;
      let newFailed = currentStats.failed;
      let lastFile = '';
      Object.values(results).forEach(res => {
        if (res.success) {
          newCompleted++;
          lastFile = res.filename;
        } else {
          newFailed++;
        }
      });
      const processed = currentIndex + batchIds.length;
      const percentage = Math.round(processed / allIds.length * 100);
      setStats(prev => ({
        ...prev,
        processed,
        completed: newCompleted,
        failed: newFailed,
        pending: allIds.length - processed,
        percentage
      }));
      if (lastFile) setLastProcessed(lastFile);

      // Small delay to allow UI updates
      await new Promise(resolve => setTimeout(resolve, 50));
      processBatches(allIds, processed, {
        completed: newCompleted,
        failed: newFailed
      }, startTime);
    } catch (error) {
      console.error('Batch failed', error);
      setStatus('error');
      setNotice({
        type: 'error',
        message: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Batch processing failed.', 'wp-bomb')
      });
    }
  };
  const handleStop = () => {
    shouldStopRef.current = true;
  };
  const handleStartOver = () => {
    setView('settings');
    setStatus('idle');
    setStats({
      total: 0,
      processed: 0,
      completed: 0,
      failed: 0,
      pending: 0,
      percentage: 0,
      startTime: null,
      duration: 0
    });
    setLastProcessed('');
    setNotice(null);
  };
  const renderSettings = () => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.PanelBody, {
    className: "bg-white border border-wp-border shadow-wp-card rounded-sm overflow-hidden p-0"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "divide-y divide-gray-100"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "grid grid-cols-1 md:grid-cols-3 gap-6 p-6 items-start"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "md:col-span-1"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("label", {
    className: "text-sm font-semibold text-wp-heading"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Images per Batch', 'wp-bomb')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", {
    className: "text-xs text-gray-500 mt-1 leading-relaxed"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('The number of images processed in a single AJAX request.', 'wp-bomb'))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "md:col-span-2"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.RangeControl, {
    value: settings.batchSize,
    onChange: value => setSettings({
      ...settings,
      batchSize: value
    }),
    min: 1,
    max: 50,
    help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Low (5-10) for shared hosting, High (20+) for dedicated servers.', 'wp-bomb')
  }))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "grid grid-cols-1 md:grid-cols-3 gap-6 p-6 items-start"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "md:col-span-1"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("label", {
    className: "text-sm font-semibold text-wp-heading"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Target Thumbnail Sizes', 'wp-bomb')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", {
    className: "text-xs text-gray-500 mt-1 leading-relaxed"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Select specific sizes to regenerate to save time and resources.', 'wp-bomb'))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "md:col-span-2 space-y-3"
  }, isLoadingSizes ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Spinner, null) : Object.entries(availableSizes).map(([size, label]) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.CheckboxControl, {
    key: size,
    label: label,
    checked: settings.selectedSizes.includes(size),
    onChange: checked => {
      const newSelected = checked ? [...settings.selectedSizes, size] : settings.selectedSizes.filter(s => s !== size);
      setSettings({
        ...settings,
        selectedSizes: newSelected
      });
    }
  })))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "grid grid-cols-1 md:grid-cols-3 gap-6 p-6 items-start"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "md:col-span-1"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("label", {
    className: "text-sm font-semibold text-wp-heading"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Advanced Options', 'wp-bomb'))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "md:col-span-2"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.CheckboxControl, {
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Skip existing correctly sized thumbnails', 'wp-bomb'),
    help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Only regenerate if the file is missing or dimensions are incorrect.', 'wp-bomb'),
    checked: settings.skipExisting,
    onChange: checked => setSettings({
      ...settings,
      skipExisting: checked
    })
  })))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "bg-gray-50 border-t border-wp-border px-6 py-4 flex items-center justify-end"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
    variant: "primary",
    onClick: handleStart,
    disabled: settings.selectedSizes.length === 0
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Start Regenerating Thumbnails', 'wp-bomb'))));
  const renderProgress = () => {
    const isCompleted = status === 'completed';
    const isStopped = status === 'stopped';
    const isRunning = status === 'processing';
    return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Card, {
      className: "bg-wp-surface border border-wp-border shadow-wp-card sm:rounded-sm"
    }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.CardHeader, {
      className: "px-4 py-4 sm:px-6 border-b border-wp-border flex justify-between items-center bg-white"
    }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("h3", {
      className: "text-sm font-semibold text-gray-900"
    }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Progress', 'wp-bomb')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
      className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isCompleted ? 'bg-green-100 text-green-800' : isRunning ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`
    }, status.charAt(0).toUpperCase() + status.slice(1))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.CardBody, {
      className: "p-4 sm:p-6 space-y-6"
    }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      className: "space-y-2"
    }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      className: "flex justify-between text-sm text-wp-sub mb-1"
    }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Processing image ', 'wp-bomb'), " ", (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("strong", null, stats.processed), " ", (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)(' of ', 'wp-bomb'), " ", (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("strong", null, stats.total)), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
      className: "font-medium text-gray-800"
    }, stats.percentage, "%")), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.ProgressBar, {
      value: stats.percentage,
      className: "w-full"
    }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", {
      className: "text-xs text-wp-sub italic mt-1"
    }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Last processed: ', 'wp-bomb'), " ", (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
      className: "text-gray-600"
    }, lastProcessed || (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Waiting...', 'wp-bomb')))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      className: "grid grid-cols-1 md:grid-cols-3 gap-4 py-2"
    }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      className: "flex flex-col border-l-4 border-green-500 bg-white pl-4 py-1"
    }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
      className: "text-xs font-medium text-wp-sub uppercase tracking-wide"
    }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Completed', 'wp-bomb')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      className: "flex items-baseline mt-1"
    }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
      className: "text-2xl font-semibold text-gray-900"
    }, stats.completed), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
      className: "ml-2 text-sm text-gray-500"
    }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('items', 'wp-bomb')))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      className: "flex flex-col border-l-4 border-red-500 bg-white pl-4 py-1"
    }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
      className: "text-xs font-medium text-wp-sub uppercase tracking-wide"
    }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Failed', 'wp-bomb')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      className: "flex items-baseline mt-1"
    }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
      className: "text-2xl font-semibold text-gray-900"
    }, stats.failed), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
      className: "ml-2 text-sm text-gray-500"
    }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('items', 'wp-bomb')))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      className: "flex flex-col border-l-4 border-orange-500 bg-white pl-4 py-1"
    }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
      className: "text-xs font-medium text-wp-sub uppercase tracking-wide"
    }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Pending', 'wp-bomb')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      className: "flex items-baseline mt-1"
    }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
      className: "text-2xl font-semibold text-gray-900"
    }, stats.pending), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
      className: "ml-2 text-sm text-gray-500"
    }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('items', 'wp-bomb'))))), isCompleted && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Notice, {
      status: "success",
      isDismissible: false
    }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Successfully regenerated thumbnails for %d images in %d seconds.', 'wp-bomb'), stats.completed, stats.duration)), notice && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Notice, {
      status: notice.type,
      onRemove: () => setNotice(null)
    }, notice.message)), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.CardFooter, {
      className: "pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3"
    }, isCompleted && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
      variant: "primary",
      onClick: () => window.location.href = window.wpBombData.admin_url + 'upload.php'
    }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Return to Media Library', 'wp-bomb')), (isCompleted || isStopped) && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
      variant: "secondary",
      onClick: handleStartOver
    }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Start Over', 'wp-bomb')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      className: "flex-grow"
    }), isRunning && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
      variant: "link",
      isDestructive: true,
      onClick: handleStop
    }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Stop Process', 'wp-bomb'))));
  };
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "wp-bomb-module mt-8"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "mb-6"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("h2", {
    className: "text-2xl font-medium text-gray-800 mb-2"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Regenerate Thumbnails', 'wp-bomb')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", {
    className: "text-[13px] text-wp-sub leading-relaxed max-w-4xl"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('This tool regenerates thumbnails for all image attachments. This is useful if you have changed your theme or one of your thumbnail dimensions.', 'wp-bomb'))), view === 'settings' ? renderSettings() : renderProgress());
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (RegenerateThumbnails);

/***/ },

/***/ "@wordpress/api-fetch"
/*!**********************************!*\
  !*** external ["wp","apiFetch"] ***!
  \**********************************/
(module) {

module.exports = window["wp"]["apiFetch"];

/***/ },

/***/ "@wordpress/components"
/*!************************************!*\
  !*** external ["wp","components"] ***!
  \************************************/
(module) {

module.exports = window["wp"]["components"];

/***/ },

/***/ "@wordpress/element"
/*!*********************************!*\
  !*** external ["wp","element"] ***!
  \*********************************/
(module) {

module.exports = window["wp"]["element"];

/***/ },

/***/ "@wordpress/i18n"
/*!******************************!*\
  !*** external ["wp","i18n"] ***!
  \******************************/
(module) {

module.exports = window["wp"]["i18n"];

/***/ },

/***/ "react"
/*!************************!*\
  !*** external "React" ***!
  \************************/
(module) {

module.exports = window["React"];

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Check if module exists (development only)
/******/ 		if (__webpack_modules__[moduleId] === undefined) {
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!****************************!*\
  !*** ./assets/js/index.js ***!
  \****************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _components_AutoAttachThumbnail__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./components/AutoAttachThumbnail */ "./assets/js/components/AutoAttachThumbnail.js");
/* harmony import */ var _components_RegenerateThumbnails__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./components/RegenerateThumbnails */ "./assets/js/components/RegenerateThumbnails.js");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__);





const App = () => {
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    const initDarkMode = () => {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      }
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        if (event.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      });
    };
    initDarkMode();
  }, []);
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "px-4 sm:px-8 lg:px-12 py-8 max-w-6xl mx-auto"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("header", {
    className: "mb-8"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("h1", {
    className: "text-3xl font-normal text-wp-text mb-2"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Dev Tools', 'wp-bomb')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", {
    className: "text-sm text-wp-sub leading-relaxed max-w-3xl"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Utility tools for WordPress developers to automate common tasks and streamline workflow.', 'wp-bomb'))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "bg-wp-surface dark:bg-[#2c3338] border-l-4 border-wp-primary shadow-wp-card p-4 mb-8 flex items-start rounded-r-sm"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "dashicons dashicons-info text-wp-primary mr-3 mt-0.5 flex-shrink-0"
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", {
    className: "text-sm text-wp-text leading-relaxed"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Make sure to backup your database before running bulk operations.', 'wp-bomb')))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_AutoAttachThumbnail__WEBPACK_IMPORTED_MODULE_2__["default"], null), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_RegenerateThumbnails__WEBPACK_IMPORTED_MODULE_3__["default"], null), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("footer", {
    className: "mt-12 pt-6 border-t border-wp-border flex justify-between items-center text-xs text-wp-sub"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Thank you for creating with ', 'wp-bomb'), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("a", {
    className: "text-wp-primary hover:underline",
    href: "https://wordpress.org/"
  }, "WordPress"), ".")));
};
document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('wp-bomb-dev-tools-root');
  if (root) {
    (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.render)((0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(App, null), root);
  }
});
})();

/******/ })()
;
//# sourceMappingURL=index.js.map