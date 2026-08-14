module.exports = [
"[project]/apps/frontend/src/components/Logo.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Logo",
    ()=>Logo
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
;
function Logo({ size = 'md', variant = 'default', onClick }) {
    const sizes = {
        sm: {
            mark: 22,
            text: 'text-base'
        },
        md: {
            mark: 28,
            text: 'text-lg'
        },
        lg: {
            mark: 36,
            text: 'text-2xl'
        }
    };
    const textColor = variant === 'white' ? '#FAFAF8' : '#0D1B2A';
    const accentColor = variant === 'white' ? '#1BB8A3' : '#0D7377';
    const s = sizes[size];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        onClick: onClick,
        className: "inline-flex min-w-0 cursor-pointer select-none items-center gap-2.5",
        type: "button",
        "aria-label": "Shohoj_Rin home",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                width: s.mark,
                height: s.mark,
                viewBox: "0 0 28 28",
                fill: "none",
                xmlns: "http://www.w3.org/2000/svg",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                        width: "28",
                        height: "28",
                        rx: "6",
                        fill: accentColor
                    }, void 0, false, {
                        fileName: "[project]/apps/frontend/src/components/Logo.tsx",
                        lineNumber: 32,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                        x: "1.5",
                        y: "1.5",
                        width: "25",
                        height: "25",
                        rx: "5",
                        stroke: textColor === '#FAFAF8' ? 'rgba(255,255,255,0.2)' : '#0D1B2A',
                        strokeWidth: "1.5"
                    }, void 0, false, {
                        fileName: "[project]/apps/frontend/src/components/Logo.tsx",
                        lineNumber: 33,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                        d: "M7 10C7 8.9 7.9 8 9 8H13.5C15.4 8 17 9.6 17 11.5C17 13.4 15.4 15 13.5 15H9V20H7V10Z",
                        fill: "white"
                    }, void 0, false, {
                        fileName: "[project]/apps/frontend/src/components/Logo.tsx",
                        lineNumber: 34,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                        d: "M14.5 15H16L20 20H17.5L14.5 15Z",
                        fill: "rgba(255,255,255,0.6)"
                    }, void 0, false, {
                        fileName: "[project]/apps/frontend/src/components/Logo.tsx",
                        lineNumber: 38,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                        x: "9",
                        y: "10",
                        width: "4",
                        height: "3",
                        rx: "1",
                        fill: accentColor
                    }, void 0, false, {
                        fileName: "[project]/apps/frontend/src/components/Logo.tsx",
                        lineNumber: 42,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/frontend/src/components/Logo.tsx",
                lineNumber: 25,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: `font-semibold ${s.text} tracking-tight`,
                style: {
                    color: textColor
                },
                children: [
                    "Shohoj",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            color: accentColor
                        },
                        children: "_Rin"
                    }, void 0, false, {
                        fileName: "[project]/apps/frontend/src/components/Logo.tsx",
                        lineNumber: 48,
                        columnNumber: 15
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/frontend/src/components/Logo.tsx",
                lineNumber: 44,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/frontend/src/components/Logo.tsx",
        lineNumber: 19,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/frontend/src/components/Badge.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AppStatusBadge",
    ()=>AppStatusBadge,
    "Badge",
    ()=>Badge,
    "LoanStatusBadge",
    ()=>LoanStatusBadge
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
;
const variantClasses = {
    success: 'bg-emerald-light text-emerald border border-emerald/30',
    warning: 'bg-yellow-light text-stone-700 border border-yellow/40',
    error: 'bg-coral-light text-coral border border-coral/30',
    info: 'bg-sky-light text-sky border border-sky/30',
    neutral: 'bg-stone-100 text-stone-600 border border-stone-200',
    teal: 'bg-teal-light text-teal border border-teal/30',
    sky: 'bg-sky-light text-sky border border-sky/30'
};
const dotColors = {
    success: 'bg-emerald',
    warning: 'bg-yellow',
    error: 'bg-coral',
    info: 'bg-sky',
    neutral: 'bg-stone-400',
    teal: 'bg-teal',
    sky: 'bg-sky'
};
function Badge({ variant = 'neutral', size = 'md', dot = false, children, className = '' }) {
    const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: `inline-flex items-center gap-1.5 font-medium rounded-[4px] ${sizeClass} ${variantClasses[variant]} ${className}`,
        children: [
            dot && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: `w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant]}`
            }, void 0, false, {
                fileName: "[project]/apps/frontend/src/components/Badge.tsx",
                lineNumber: 41,
                columnNumber: 9
            }, this),
            children
        ]
    }, void 0, true, {
        fileName: "[project]/apps/frontend/src/components/Badge.tsx",
        lineNumber: 37,
        columnNumber: 5
    }, this);
}
function LoanStatusBadge({ status }) {
    const map = {
        active: {
            variant: 'teal',
            label: 'Active'
        },
        pending: {
            variant: 'warning',
            label: 'Pending'
        },
        approved: {
            variant: 'success',
            label: 'Approved'
        },
        rejected: {
            variant: 'error',
            label: 'Rejected'
        },
        disbursed: {
            variant: 'sky',
            label: 'Disbursed'
        },
        closed: {
            variant: 'neutral',
            label: 'Closed'
        },
        overdue: {
            variant: 'error',
            label: 'Overdue'
        }
    };
    const { variant, label } = map[status];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Badge, {
        variant: variant,
        dot: true,
        children: label
    }, void 0, false, {
        fileName: "[project]/apps/frontend/src/components/Badge.tsx",
        lineNumber: 60,
        columnNumber: 10
    }, this);
}
function AppStatusBadge({ status }) {
    const map = {
        submitted: {
            variant: 'info',
            label: 'Submitted'
        },
        'under-review': {
            variant: 'warning',
            label: 'Under Review'
        },
        'info-required': {
            variant: 'warning',
            label: 'Info Required'
        },
        approved: {
            variant: 'success',
            label: 'Approved'
        },
        rejected: {
            variant: 'error',
            label: 'Rejected'
        },
        disbursed: {
            variant: 'teal',
            label: 'Disbursed'
        }
    };
    const { variant, label } = map[status];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Badge, {
        variant: variant,
        dot: true,
        children: label
    }, void 0, false, {
        fileName: "[project]/apps/frontend/src/components/Badge.tsx",
        lineNumber: 74,
        columnNumber: 10
    }, this);
}
}),
"[project]/apps/frontend/src/components/Button.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Button",
    ()=>Button,
    "IconButton",
    ()=>IconButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
;
function Button({ variant = 'primary', size = 'md', loading = false, icon, iconPosition = 'left', children, fullWidth = false, disabled, className = '', ...props }) {
    const isDisabled = disabled || loading;
    const base = 'inline-flex items-center justify-center gap-2 text-center font-medium leading-tight transition-all duration-100 select-none';
    const widthClass = fullWidth ? 'w-full' : '';
    const sizeClasses = {
        xs: 'min-h-7 px-2.5 py-1.5 text-xs rounded-[4px]',
        sm: 'min-h-9 px-3 py-2 text-sm rounded-[6px]',
        md: 'min-h-11 px-4 py-2.5 text-sm rounded-[6px]',
        lg: 'min-h-12 px-5 py-3 text-base rounded-[6px]'
    };
    const variantClasses = {
        primary: 'bg-teal text-white border-[1.5px] border-navy shadow-nb-sm hover:opacity-90 active:shadow-nb-xs active:translate-y-px',
        secondary: 'bg-white text-navy border-[1.5px] border-navy shadow-nb-sm hover:bg-stone-50 active:shadow-nb-xs active:translate-y-px',
        tertiary: 'bg-teal-light text-teal-dark border-[1.5px] border-teal/50 hover:bg-teal/10 active:opacity-80',
        destructive: 'bg-coral text-white border-[1.5px] border-navy shadow-nb-sm hover:opacity-90 active:shadow-nb-xs active:translate-y-px',
        ghost: 'bg-transparent text-navy hover:bg-stone-100 active:bg-stone-200',
        navy: 'bg-navy text-white border-[1.5px] border-navy shadow-nb-sm hover:bg-navy-mid active:shadow-nb-xs active:translate-y-px'
    };
    const disabledClass = isDisabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'cursor-pointer';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        disabled: isDisabled,
        className: `${base} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${disabledClass} ${className}`,
        ...props,
        children: [
            loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
            }, void 0, false, {
                fileName: "[project]/apps/frontend/src/components/Button.tsx",
                lineNumber: 66,
                columnNumber: 9
            }, this) : icon && iconPosition === 'left' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "shrink-0",
                children: icon
            }, void 0, false, {
                fileName: "[project]/apps/frontend/src/components/Button.tsx",
                lineNumber: 68,
                columnNumber: 44
            }, this),
            children,
            !loading && icon && iconPosition === 'right' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "shrink-0",
                children: icon
            }, void 0, false, {
                fileName: "[project]/apps/frontend/src/components/Button.tsx",
                lineNumber: 72,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/frontend/src/components/Button.tsx",
        lineNumber: 60,
        columnNumber: 5
    }, this);
}
function IconButton({ variant = 'secondary', size = 'md', label, children, className = '', ...props }) {
    const sizeClasses = {
        xs: 'w-7 h-7 rounded-[4px]',
        sm: 'w-9 h-9 rounded-[6px]',
        md: 'w-11 h-11 rounded-[6px]',
        lg: 'w-12 h-12 rounded-[6px]'
    };
    const variantClasses = {
        primary: 'bg-teal text-white border-[1.5px] border-navy hover:opacity-90',
        secondary: 'bg-white text-navy border-[1.5px] border-stone-300 hover:border-navy hover:bg-stone-50',
        tertiary: 'bg-teal-light text-teal border-[1.5px] border-teal hover:bg-teal/10',
        destructive: 'bg-coral text-white border-[1.5px] border-navy hover:opacity-90',
        ghost: 'bg-transparent text-navy hover:bg-stone-100',
        navy: 'bg-navy text-white border-[1.5px] border-navy hover:bg-navy-mid'
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        "aria-label": label,
        title: label,
        className: `inline-flex items-center justify-center shrink-0 transition-all duration-100 cursor-pointer ${sizeClasses[size]} ${variantClasses[variant]} ${className}`,
        ...props,
        children: children
    }, void 0, false, {
        fileName: "[project]/apps/frontend/src/components/Button.tsx",
        lineNumber: 110,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/frontend/src/components/AppLayout.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AppLayout",
    ()=>AppLayout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$Logo$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/src/components/Logo.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$Badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/src/components/Badge.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/src/components/Button.tsx [app-ssr] (ecmascript)");
;
;
;
;
;
const borrowerNav = [
    {
        label: 'Dashboard',
        page: 'borrower-dashboard',
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            width: "16",
            height: "16",
            viewBox: "0 0 16 16",
            fill: "none",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                    x: "1",
                    y: "1",
                    width: "6",
                    height: "6",
                    rx: "1",
                    stroke: "currentColor",
                    strokeWidth: "1.5"
                }, void 0, false, {
                    fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                    lineNumber: 27,
                    columnNumber: 71
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                    x: "9",
                    y: "1",
                    width: "6",
                    height: "6",
                    rx: "1",
                    stroke: "currentColor",
                    strokeWidth: "1.5"
                }, void 0, false, {
                    fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                    lineNumber: 27,
                    columnNumber: 158
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                    x: "1",
                    y: "9",
                    width: "6",
                    height: "6",
                    rx: "1",
                    stroke: "currentColor",
                    strokeWidth: "1.5"
                }, void 0, false, {
                    fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                    lineNumber: 27,
                    columnNumber: 245
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                    x: "9",
                    y: "9",
                    width: "6",
                    height: "6",
                    rx: "1",
                    stroke: "currentColor",
                    strokeWidth: "1.5"
                }, void 0, false, {
                    fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                    lineNumber: 27,
                    columnNumber: 332
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
            lineNumber: 27,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0))
    },
    {
        label: 'Explore Loans',
        page: 'loan-marketplace',
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            width: "16",
            height: "16",
            viewBox: "0 0 16 16",
            fill: "none",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                    cx: "7",
                    cy: "7",
                    r: "5",
                    stroke: "currentColor",
                    strokeWidth: "1.5"
                }, void 0, false, {
                    fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                    lineNumber: 31,
                    columnNumber: 71
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                    d: "M11 11L14 14",
                    stroke: "currentColor",
                    strokeWidth: "1.5",
                    strokeLinecap: "round"
                }, void 0, false, {
                    fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                    lineNumber: 31,
                    columnNumber: 140
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
            lineNumber: 31,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0))
    },
    {
        label: 'My Loans',
        page: 'active-loan',
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            width: "16",
            height: "16",
            viewBox: "0 0 16 16",
            fill: "none",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                    x: "2",
                    y: "4",
                    width: "12",
                    height: "9",
                    rx: "1",
                    stroke: "currentColor",
                    strokeWidth: "1.5"
                }, void 0, false, {
                    fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                    lineNumber: 35,
                    columnNumber: 71
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                    d: "M5 4V3a3 3 0 016 0v1",
                    stroke: "currentColor",
                    strokeWidth: "1.5",
                    strokeLinecap: "round"
                }, void 0, false, {
                    fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                    lineNumber: 35,
                    columnNumber: 159
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
            lineNumber: 35,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0))
    },
    {
        label: 'Applications',
        page: 'application-status',
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            width: "16",
            height: "16",
            viewBox: "0 0 16 16",
            fill: "none",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                    d: "M3 2h10a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z",
                    stroke: "currentColor",
                    strokeWidth: "1.5"
                }, void 0, false, {
                    fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                    lineNumber: 39,
                    columnNumber: 71
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                    d: "M5 6h6M5 9h4",
                    stroke: "currentColor",
                    strokeWidth: "1.5",
                    strokeLinecap: "round"
                }, void 0, false, {
                    fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                    lineNumber: 39,
                    columnNumber: 188
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
            lineNumber: 39,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0)),
        badge: 2
    },
    {
        label: 'Repayments',
        page: 'repayment',
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            width: "16",
            height: "16",
            viewBox: "0 0 16 16",
            fill: "none",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                    cx: "8",
                    cy: "8",
                    r: "6",
                    stroke: "currentColor",
                    strokeWidth: "1.5"
                }, void 0, false, {
                    fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                    lineNumber: 44,
                    columnNumber: 71
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                    d: "M8 5v3l2 2",
                    stroke: "currentColor",
                    strokeWidth: "1.5",
                    strokeLinecap: "round"
                }, void 0, false, {
                    fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                    lineNumber: 44,
                    columnNumber: 140
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
            lineNumber: 44,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0))
    },
    {
        label: 'Learn',
        page: 'education',
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            width: "16",
            height: "16",
            viewBox: "0 0 16 16",
            fill: "none",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                    d: "M1 4l7-3 7 3-7 3-7-3z",
                    stroke: "currentColor",
                    strokeWidth: "1.5",
                    strokeLinejoin: "round"
                }, void 0, false, {
                    fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                    lineNumber: 48,
                    columnNumber: 71
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                    d: "M15 4v5M4 6.5v4a7 7 0 008 0v-4",
                    stroke: "currentColor",
                    strokeWidth: "1.5",
                    strokeLinecap: "round"
                }, void 0, false, {
                    fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                    lineNumber: 48,
                    columnNumber: 167
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
            lineNumber: 48,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0))
    }
];
const lenderNav = [
    {
        label: 'Portfolio',
        page: 'lender-dashboard',
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            width: "16",
            height: "16",
            viewBox: "0 0 16 16",
            fill: "none",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                    x: "1",
                    y: "1",
                    width: "6",
                    height: "6",
                    rx: "1",
                    stroke: "currentColor",
                    strokeWidth: "1.5"
                }, void 0, false, {
                    fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                    lineNumber: 53,
                    columnNumber: 117
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                    x: "9",
                    y: "1",
                    width: "6",
                    height: "6",
                    rx: "1",
                    stroke: "currentColor",
                    strokeWidth: "1.5"
                }, void 0, false, {
                    fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                    lineNumber: 53,
                    columnNumber: 204
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                    x: "1",
                    y: "9",
                    width: "6",
                    height: "6",
                    rx: "1",
                    stroke: "currentColor",
                    strokeWidth: "1.5"
                }, void 0, false, {
                    fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                    lineNumber: 53,
                    columnNumber: 291
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                    x: "9",
                    y: "9",
                    width: "6",
                    height: "6",
                    rx: "1",
                    stroke: "currentColor",
                    strokeWidth: "1.5"
                }, void 0, false, {
                    fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                    lineNumber: 53,
                    columnNumber: 378
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
            lineNumber: 53,
            columnNumber: 57
        }, ("TURBOPACK compile-time value", void 0))
    },
    {
        label: 'Opportunities',
        page: 'loan-marketplace',
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            width: "16",
            height: "16",
            viewBox: "0 0 16 16",
            fill: "none",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                    cx: "7",
                    cy: "7",
                    r: "5",
                    stroke: "currentColor",
                    strokeWidth: "1.5"
                }, void 0, false, {
                    fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                    lineNumber: 54,
                    columnNumber: 121
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                    d: "M11 11L14 14",
                    stroke: "currentColor",
                    strokeWidth: "1.5",
                    strokeLinecap: "round"
                }, void 0, false, {
                    fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                    lineNumber: 54,
                    columnNumber: 190
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
            lineNumber: 54,
            columnNumber: 61
        }, ("TURBOPACK compile-time value", void 0))
    }
];
const adminNav = [
    {
        label: 'Admin Overview',
        page: 'admin',
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            width: "16",
            height: "16",
            viewBox: "0 0 16 16",
            fill: "none",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                    x: "1",
                    y: "1",
                    width: "6",
                    height: "6",
                    rx: "1",
                    stroke: "currentColor",
                    strokeWidth: "1.5"
                }, void 0, false, {
                    fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                    lineNumber: 58,
                    columnNumber: 111
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                    x: "9",
                    y: "1",
                    width: "6",
                    height: "6",
                    rx: "1",
                    stroke: "currentColor",
                    strokeWidth: "1.5"
                }, void 0, false, {
                    fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                    lineNumber: 58,
                    columnNumber: 198
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                    x: "1",
                    y: "9",
                    width: "6",
                    height: "6",
                    rx: "1",
                    stroke: "currentColor",
                    strokeWidth: "1.5"
                }, void 0, false, {
                    fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                    lineNumber: 58,
                    columnNumber: 285
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                    x: "9",
                    y: "9",
                    width: "6",
                    height: "6",
                    rx: "1",
                    stroke: "currentColor",
                    strokeWidth: "1.5"
                }, void 0, false, {
                    fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                    lineNumber: 58,
                    columnNumber: 372
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
            lineNumber: 58,
            columnNumber: 51
        }, ("TURBOPACK compile-time value", void 0))
    },
    {
        label: 'Applications',
        page: 'application-status',
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            width: "16",
            height: "16",
            viewBox: "0 0 16 16",
            fill: "none",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                    d: "M3 2h10a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z",
                    stroke: "currentColor",
                    strokeWidth: "1.5"
                }, void 0, false, {
                    fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                    lineNumber: 59,
                    columnNumber: 122
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                    d: "M5 6h6M5 9h4",
                    stroke: "currentColor",
                    strokeWidth: "1.5",
                    strokeLinecap: "round"
                }, void 0, false, {
                    fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                    lineNumber: 59,
                    columnNumber: 239
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
            lineNumber: 59,
            columnNumber: 62
        }, ("TURBOPACK compile-time value", void 0)),
        badge: 14
    }
];
function NavItem({ item, active, onClick }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        type: "button",
        onClick: onClick,
        className: `w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-[6px] transition-colors text-left ${active ? 'bg-teal text-white' : 'text-stone-600 hover:bg-stone-100 hover:text-navy'}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: active ? 'text-white' : 'text-stone-500',
                children: item.icon
            }, void 0, false, {
                fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                lineNumber: 73,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "flex-1",
                children: item.label
            }, void 0, false, {
                fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                lineNumber: 74,
                columnNumber: 7
            }, this),
            item.badge && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$Badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Badge"], {
                variant: active ? 'neutral' : 'teal',
                size: "sm",
                children: item.badge
            }, void 0, false, {
                fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                lineNumber: 76,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
        lineNumber: 64,
        columnNumber: 5
    }, this);
}
function AppLayout({ children, onNavigate, currentPage, userType = 'borrower', userName = 'Riya Ahmed' }) {
    const [sidebarOpen, setSidebarOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [notifOpen, setNotifOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const navItems = userType === 'admin' ? adminNav : userType === 'lender' ? lenderNav : borrowerNav;
    const sidebar = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
        className: "w-56 shrink-0 flex flex-col border-r border-stone-200 bg-offwhite h-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "px-4 py-4 border-b border-stone-200",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$Logo$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Logo"], {
                    size: "sm",
                    onClick: ()=>onNavigate('landing')
                }, void 0, false, {
                    fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                    lineNumber: 91,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                lineNumber: 90,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                className: "flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1",
                children: navItems.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(NavItem, {
                        item: item,
                        active: currentPage === item.page,
                        onClick: ()=>{
                            onNavigate(item.page);
                            setSidebarOpen(false);
                        }
                    }, item.page, false, {
                        fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                        lineNumber: 95,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                lineNumber: 93,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "px-3 py-4 border-t border-stone-200",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-2.5 px-2 py-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-8 h-8 rounded-full bg-teal text-white flex items-center justify-center text-xs font-semibold border border-teal/30",
                            children: userName.split(' ').map((w)=>w[0]).join('').slice(0, 2)
                        }, void 0, false, {
                            fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                            lineNumber: 105,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex-1 min-w-0",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs font-medium text-navy truncate",
                                    children: userName
                                }, void 0, false, {
                                    fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                                    lineNumber: 109,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-[10px] text-stone-500 capitalize",
                                    children: userType
                                }, void 0, false, {
                                    fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                                    lineNumber: 110,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                            lineNumber: 108,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                    lineNumber: 104,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                lineNumber: 103,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
        lineNumber: 89,
        columnNumber: 5
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex h-dvh overflow-hidden bg-offwhite",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "hidden md:flex h-full",
                children: sidebar
            }, void 0, false, {
                fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                lineNumber: 120,
                columnNumber: 7
            }, this),
            sidebarOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 z-50 flex md:hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        "aria-label": "Close menu",
                        className: "absolute inset-0 bg-navy/40",
                        onClick: ()=>setSidebarOpen(false)
                    }, void 0, false, {
                        fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                        lineNumber: 125,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative z-10 h-full w-[15rem] max-w-[85vw]",
                        role: "dialog",
                        "aria-label": "Main navigation",
                        onClick: ()=>setSidebarOpen(false),
                        children: sidebar
                    }, void 0, false, {
                        fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                        lineNumber: 131,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                lineNumber: 124,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 flex flex-col min-w-0 overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                        className: "flex h-14 shrink-0 items-center gap-3 border-b border-stone-200 bg-offwhite/95 px-4 backdrop-blur-sm md:px-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "grid h-10 w-10 shrink-0 place-items-center rounded-[6px] hover:bg-stone-100 md:hidden",
                                onClick: ()=>setSidebarOpen(true),
                                "aria-label": "Open menu",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    width: "16",
                                    height: "16",
                                    viewBox: "0 0 16 16",
                                    fill: "none",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        d: "M1.5 4h13M1.5 8h13M1.5 12h13",
                                        stroke: "#0D1B2A",
                                        strokeWidth: "1.5",
                                        strokeLinecap: "round"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                                        lineNumber: 153,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                                    lineNumber: 152,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                                lineNumber: 146,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "min-w-0 flex-1 truncate text-sm font-medium text-stone-500",
                                children: navItems.find((i)=>i.page === currentPage)?.label ?? 'Shohoj_Rin'
                            }, void 0, false, {
                                fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                                lineNumber: 157,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["IconButton"], {
                                        label: "Notifications",
                                        size: "sm",
                                        variant: "ghost",
                                        onClick: ()=>setNotifOpen(!notifOpen),
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                width: "15",
                                                height: "15",
                                                viewBox: "0 0 16 16",
                                                fill: "none",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    d: "M8 14a1.5 1.5 0 003 0H5a1.5 1.5 0 003 0zM14 11c-1-1-2-2-2-5a4 4 0 10-8 0c0 3-1 4-2 5h12z",
                                                    stroke: "currentColor",
                                                    strokeWidth: "1.5",
                                                    strokeLinejoin: "round"
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                                                    lineNumber: 169,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                                                lineNumber: 168,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "absolute -top-0.5 -right-0.5 w-2 h-2 bg-coral rounded-full border border-white"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                                                lineNumber: 171,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                                        lineNumber: 162,
                                        columnNumber: 13
                                    }, this),
                                    notifOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute right-0 top-full mt-2 w-72 bg-white border-[1.5px] border-navy shadow-nb rounded-[8px] overflow-hidden z-10",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "px-4 py-3 border-b border-stone-200 flex items-center justify-between",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm font-semibold text-navy",
                                                        children: "Notifications"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                                                        lineNumber: 177,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-xs text-teal cursor-pointer hover:underline",
                                                        children: "Mark all read"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                                                        lineNumber: 178,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                                                lineNumber: 176,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "max-h-72 overflow-y-auto flex flex-col gap-px p-2",
                                                children: [
                                                    {
                                                        title: 'Repayment due in 3 days',
                                                        msg: 'Your EMI of ৳4,500 is due on Dec 15.',
                                                        time: '2h ago',
                                                        unread: true
                                                    },
                                                    {
                                                        title: 'Application update',
                                                        msg: 'Your loan application SR-2025-4812 is under review.',
                                                        time: '1d ago',
                                                        unread: true
                                                    },
                                                    {
                                                        title: 'Payment confirmed',
                                                        msg: 'Your repayment of ৳4,500 was received successfully.',
                                                        time: '3d ago',
                                                        unread: false
                                                    }
                                                ].map((n, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: `px-3 py-2.5 rounded-[4px] ${n.unread ? 'bg-teal-light' : 'hover:bg-stone-50'}`,
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex min-w-0 items-start gap-2",
                                                            children: [
                                                                n.unread && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "w-1.5 h-1.5 rounded-full bg-teal mt-1.5 shrink-0"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                                                                    lineNumber: 188,
                                                                    columnNumber: 38
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "min-w-0",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-xs font-medium text-navy",
                                                                            children: n.title
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                                                                            lineNumber: 190,
                                                                            columnNumber: 27
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-xs text-stone-500 mt-0.5",
                                                                            children: n.msg
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                                                                            lineNumber: 191,
                                                                            columnNumber: 27
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-[10px] text-stone-400 mt-1",
                                                                            children: n.time
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                                                                            lineNumber: 192,
                                                                            columnNumber: 27
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                                                                    lineNumber: 189,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                                                            lineNumber: 187,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, i, false, {
                                                        fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                                                        lineNumber: 186,
                                                        columnNumber: 21
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                                                lineNumber: 180,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                                        lineNumber: 175,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                                lineNumber: 161,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                "aria-label": `Account menu for ${userName}`,
                                className: "grid h-9 w-9 shrink-0 place-items-center rounded-full bg-teal text-xs font-semibold text-white",
                                children: userName.split(' ').map((w)=>w[0]).join('').slice(0, 2)
                            }, void 0, false, {
                                fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                                lineNumber: 202,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                        lineNumber: 145,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "min-w-0 flex-1 overflow-y-auto overflow-x-hidden",
                        children: children
                    }, void 0, false, {
                        fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                        lineNumber: 216,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
                lineNumber: 143,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/frontend/src/components/AppLayout.tsx",
        lineNumber: 118,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/frontend/src/components/PageHeader.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PageHeader",
    ()=>PageHeader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
;
function PageHeader({ eyebrow, title, description, actions }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
        className: "mb-6 grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "min-w-0",
                children: [
                    eyebrow && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mb-1 text-xs font-semibold uppercase tracking-widest text-teal",
                        children: eyebrow
                    }, void 0, false, {
                        fileName: "[project]/apps/frontend/src/components/PageHeader.tsx",
                        lineNumber: 15,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-2xl font-semibold text-navy sm:text-3xl",
                        children: title
                    }, void 0, false, {
                        fileName: "[project]/apps/frontend/src/components/PageHeader.tsx",
                        lineNumber: 17,
                        columnNumber: 9
                    }, this),
                    description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-1.5 max-w-2xl text-sm text-stone-500",
                        children: description
                    }, void 0, false, {
                        fileName: "[project]/apps/frontend/src/components/PageHeader.tsx",
                        lineNumber: 18,
                        columnNumber: 25
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/frontend/src/components/PageHeader.tsx",
                lineNumber: 13,
                columnNumber: 7
            }, this),
            actions && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap gap-2 sm:justify-end",
                children: actions
            }, void 0, false, {
                fileName: "[project]/apps/frontend/src/components/PageHeader.tsx",
                lineNumber: 20,
                columnNumber: 19
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/frontend/src/components/PageHeader.tsx",
        lineNumber: 12,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/frontend/src/components/Card.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Card",
    ()=>Card,
    "CardBody",
    ()=>CardBody,
    "CardHeader",
    ()=>CardHeader,
    "DataRow",
    ()=>DataRow
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
;
const variantClasses = {
    // Calm default for data-dense financial surfaces.
    plain: 'bg-white border-[1.5px] border-stone-200',
    // Neubrutalist emphasis — used selectively for key cards.
    raised: 'bg-white border-[1.5px] border-navy shadow-nb',
    accent: 'bg-teal-light border-[1.5px] border-teal/30',
    muted: 'bg-stone-50 border border-stone-200'
};
function Card({ variant = 'plain', as: Tag = 'div', className = '', children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Tag, {
        className: `min-w-0 rounded-[8px] ${variantClasses[variant]} ${className}`,
        children: children
    }, void 0, false, {
        fileName: "[project]/apps/frontend/src/components/Card.tsx",
        lineNumber: 23,
        columnNumber: 5
    }, this);
}
function CardHeader({ title, description, action, className = '' }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 border-b border-stone-200 px-4 py-3.5 sm:px-5 ${className}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "min-w-0",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-[0.9375rem] font-semibold text-navy",
                        children: title
                    }, void 0, false, {
                        fileName: "[project]/apps/frontend/src/components/Card.tsx",
                        lineNumber: 43,
                        columnNumber: 9
                    }, this),
                    description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-0.5 text-sm text-stone-500",
                        children: description
                    }, void 0, false, {
                        fileName: "[project]/apps/frontend/src/components/Card.tsx",
                        lineNumber: 44,
                        columnNumber: 25
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/frontend/src/components/Card.tsx",
                lineNumber: 42,
                columnNumber: 7
            }, this),
            action && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "shrink-0",
                children: action
            }, void 0, false, {
                fileName: "[project]/apps/frontend/src/components/Card.tsx",
                lineNumber: 46,
                columnNumber: 18
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/frontend/src/components/Card.tsx",
        lineNumber: 39,
        columnNumber: 5
    }, this);
}
function CardBody({ className = '', children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `min-w-0 p-4 sm:p-5 ${className}`,
        children: children
    }, void 0, false, {
        fileName: "[project]/apps/frontend/src/components/Card.tsx",
        lineNumber: 52,
        columnNumber: 10
    }, this);
}
function DataRow({ label, value, emphasis = false, hint }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-1.5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: `min-w-0 text-sm ${emphasis ? 'font-medium text-navy' : 'text-stone-500'}`,
                children: [
                    label,
                    hint && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "mt-0.5 block text-xs text-stone-400",
                        children: hint
                    }, void 0, false, {
                        fileName: "[project]/apps/frontend/src/components/Card.tsx",
                        lineNumber: 71,
                        columnNumber: 18
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/frontend/src/components/Card.tsx",
                lineNumber: 69,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: `font-mono-sr shrink-0 text-right ${emphasis ? 'text-base font-semibold text-navy' : 'text-sm font-medium text-navy'}`,
                children: value
            }, void 0, false, {
                fileName: "[project]/apps/frontend/src/components/Card.tsx",
                lineNumber: 73,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/frontend/src/components/Card.tsx",
        lineNumber: 68,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/frontend/src/components/Tabs.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TabPanel",
    ()=>TabPanel,
    "Tabs",
    ()=>Tabs,
    "useTabs",
    ()=>useTabs
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
;
;
function Tabs({ tabs, activeTab, onChange, variant = 'underline', className = '' }) {
    const [internal, setInternal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(tabs[0]?.id ?? '');
    const active = activeTab ?? internal;
    const setActive = (id)=>{
        setInternal(id);
        onChange?.(id);
    };
    if (variant === 'pill') {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `flex gap-1 p-1 bg-stone-100 rounded-[6px] border border-stone-200 w-fit ${className}`,
            children: tabs.map((tab)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    type: "button",
                    onClick: ()=>setActive(tab.id),
                    className: `flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-[4px] transition-all duration-150 ${active === tab.id ? 'bg-white text-navy shadow-nb-xs border border-stone-200' : 'text-stone-500 hover:text-navy'}`,
                    children: [
                        tab.icon && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-xs",
                            children: tab.icon
                        }, void 0, false, {
                            fileName: "[project]/apps/frontend/src/components/Tabs.tsx",
                            lineNumber: 41,
                            columnNumber: 26
                        }, this),
                        tab.label,
                        tab.count !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: `text-xs px-1.5 py-0.5 rounded-full font-mono-sr ${active === tab.id ? 'bg-teal-light text-teal' : 'bg-stone-200 text-stone-500'}`,
                            children: tab.count
                        }, void 0, false, {
                            fileName: "[project]/apps/frontend/src/components/Tabs.tsx",
                            lineNumber: 44,
                            columnNumber: 15
                        }, this)
                    ]
                }, tab.id, true, {
                    fileName: "[project]/apps/frontend/src/components/Tabs.tsx",
                    lineNumber: 31,
                    columnNumber: 11
                }, this))
        }, void 0, false, {
            fileName: "[project]/apps/frontend/src/components/Tabs.tsx",
            lineNumber: 29,
            columnNumber: 7
        }, this);
    }
    if (variant === 'card') {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `flex gap-2 ${className}`,
            children: tabs.map((tab)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    type: "button",
                    onClick: ()=>setActive(tab.id),
                    className: `flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-[6px] border-[1.5px] transition-all duration-150 ${active === tab.id ? 'bg-white text-navy border-navy shadow-nb-sm' : 'bg-transparent text-stone-500 border-stone-200 hover:border-stone-300 hover:text-navy'}`,
                    children: [
                        tab.icon && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: tab.icon
                        }, void 0, false, {
                            fileName: "[project]/apps/frontend/src/components/Tabs.tsx",
                            lineNumber: 70,
                            columnNumber: 26
                        }, this),
                        tab.label,
                        tab.count !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: `text-xs font-mono-sr ${active === tab.id ? 'text-teal' : 'text-stone-400'}`,
                            children: tab.count
                        }, void 0, false, {
                            fileName: "[project]/apps/frontend/src/components/Tabs.tsx",
                            lineNumber: 73,
                            columnNumber: 15
                        }, this)
                    ]
                }, tab.id, true, {
                    fileName: "[project]/apps/frontend/src/components/Tabs.tsx",
                    lineNumber: 60,
                    columnNumber: 11
                }, this))
        }, void 0, false, {
            fileName: "[project]/apps/frontend/src/components/Tabs.tsx",
            lineNumber: 58,
            columnNumber: 7
        }, this);
    }
    // underline (default)
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `flex border-b border-stone-200 gap-0 ${className}`,
        children: tabs.map((tab)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: ()=>setActive(tab.id),
                className: `flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-all duration-150 ${active === tab.id ? 'text-teal border-teal' : 'text-stone-500 border-transparent hover:text-navy hover:border-stone-300'}`,
                children: [
                    tab.icon && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: tab.icon
                    }, void 0, false, {
                        fileName: "[project]/apps/frontend/src/components/Tabs.tsx",
                        lineNumber: 97,
                        columnNumber: 24
                    }, this),
                    tab.label,
                    tab.count !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: `text-xs px-1.5 py-0.5 rounded-full font-mono-sr ${active === tab.id ? 'bg-teal-light text-teal' : 'bg-stone-100 text-stone-500'}`,
                        children: tab.count
                    }, void 0, false, {
                        fileName: "[project]/apps/frontend/src/components/Tabs.tsx",
                        lineNumber: 100,
                        columnNumber: 13
                    }, this)
                ]
            }, tab.id, true, {
                fileName: "[project]/apps/frontend/src/components/Tabs.tsx",
                lineNumber: 87,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/apps/frontend/src/components/Tabs.tsx",
        lineNumber: 85,
        columnNumber: 5
    }, this);
}
function TabPanel({ id, activeTab, children }) {
    if (id !== activeTab) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        role: "tabpanel",
        children: children
    }, void 0, false, {
        fileName: "[project]/apps/frontend/src/components/Tabs.tsx",
        lineNumber: 120,
        columnNumber: 10
    }, this);
}
function useTabs(defaultTab) {
    const [active, setActive] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(defaultTab);
    return {
        active,
        setActive
    };
}
}),
"[project]/apps/frontend/src/components/Alert.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Alert",
    ()=>Alert,
    "Notification",
    ()=>Notification
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
;
;
const variantConfig = {
    info: {
        bg: 'bg-sky-light',
        border: 'border-sky/40',
        title: 'text-sky',
        text: 'text-navy-mid',
        iconDefault: 'ℹ'
    },
    success: {
        bg: 'bg-emerald-light',
        border: 'border-emerald/40',
        title: 'text-emerald',
        text: 'text-navy-mid',
        iconDefault: '✓'
    },
    warning: {
        bg: 'bg-yellow-light',
        border: 'border-yellow/50',
        title: 'text-stone-700',
        text: 'text-stone-600',
        iconDefault: '!'
    },
    error: {
        bg: 'bg-coral-light',
        border: 'border-coral/40',
        title: 'text-coral',
        text: 'text-navy-mid',
        iconDefault: '✕'
    }
};
function Alert({ variant = 'info', title, children, dismissible = false, className = '', icon }) {
    const [dismissed, setDismissed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    if (dismissed) return null;
    const cfg = variantConfig[variant];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        role: "alert",
        className: `flex gap-3 p-4 rounded-[6px] border ${cfg.bg} ${cfg.border} ${className}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: `w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${cfg.title}`,
                children: icon ?? cfg.iconDefault
            }, void 0, false, {
                fileName: "[project]/apps/frontend/src/components/Alert.tsx",
                lineNumber: 59,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 min-w-0",
                children: [
                    title && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: `text-sm font-semibold mb-0.5 ${cfg.title}`,
                        children: title
                    }, void 0, false, {
                        fileName: "[project]/apps/frontend/src/components/Alert.tsx",
                        lineNumber: 64,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `text-sm leading-relaxed ${cfg.text}`,
                        children: children
                    }, void 0, false, {
                        fileName: "[project]/apps/frontend/src/components/Alert.tsx",
                        lineNumber: 66,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/frontend/src/components/Alert.tsx",
                lineNumber: 62,
                columnNumber: 7
            }, this),
            dismissible && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>setDismissed(true),
                className: "shrink-0 text-stone-400 hover:text-stone-600 transition-colors text-lg leading-none mt-0.5",
                "aria-label": "Dismiss",
                type: "button",
                children: "×"
            }, void 0, false, {
                fileName: "[project]/apps/frontend/src/components/Alert.tsx",
                lineNumber: 69,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/frontend/src/components/Alert.tsx",
        lineNumber: 55,
        columnNumber: 5
    }, this);
}
function Notification({ title, message, time, unread = false, variant = 'info' }) {
    const dotColor = {
        info: 'bg-sky',
        success: 'bg-emerald',
        warning: 'bg-yellow',
        error: 'bg-coral'
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `flex gap-3 p-3.5 rounded-[6px] border transition-colors ${unread ? 'bg-teal-light border-teal/30' : 'bg-white border-stone-200'}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: `w-2 h-2 rounded-full shrink-0 mt-1.5 ${unread ? dotColor[variant] : 'bg-stone-300'}`
            }, void 0, false, {
                fileName: "[project]/apps/frontend/src/components/Alert.tsx",
                lineNumber: 100,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 min-w-0",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm font-medium text-navy",
                        children: title
                    }, void 0, false, {
                        fileName: "[project]/apps/frontend/src/components/Alert.tsx",
                        lineNumber: 102,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-stone-500 mt-0.5 leading-relaxed",
                        children: message
                    }, void 0, false, {
                        fileName: "[project]/apps/frontend/src/components/Alert.tsx",
                        lineNumber: 103,
                        columnNumber: 9
                    }, this),
                    time && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-stone-400 mt-1",
                        children: time
                    }, void 0, false, {
                        fileName: "[project]/apps/frontend/src/components/Alert.tsx",
                        lineNumber: 104,
                        columnNumber: 18
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/frontend/src/components/Alert.tsx",
                lineNumber: 101,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/frontend/src/components/Alert.tsx",
        lineNumber: 99,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/frontend/src/components/EmptyState.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EmptyIcons",
    ()=>EmptyIcons,
    "EmptyState",
    ()=>EmptyState
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/src/components/Button.tsx [app-ssr] (ecmascript)");
;
;
function EmptyState({ icon, title, description, action, secondaryAction, className = '', size = 'md' }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `flex flex-col items-center justify-center text-center py-12 px-6 ${size === 'sm' ? 'py-8' : ''} ${className}`,
        children: [
            icon && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-12 h-12 rounded-[8px] bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 mb-4",
                children: icon
            }, void 0, false, {
                fileName: "[project]/apps/frontend/src/components/EmptyState.tsx",
                lineNumber: 28,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                className: `font-semibold text-navy mb-1 ${size === 'sm' ? 'text-sm' : 'text-base'}`,
                children: title
            }, void 0, false, {
                fileName: "[project]/apps/frontend/src/components/EmptyState.tsx",
                lineNumber: 32,
                columnNumber: 7
            }, this),
            description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: `text-stone-500 leading-relaxed max-w-xs ${size === 'sm' ? 'text-xs' : 'text-sm'}`,
                children: description
            }, void 0, false, {
                fileName: "[project]/apps/frontend/src/components/EmptyState.tsx",
                lineNumber: 34,
                columnNumber: 9
            }, this),
            (action || secondaryAction) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2 mt-5",
                children: [
                    action && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                        variant: "primary",
                        size: size === 'sm' ? 'sm' : 'md',
                        onClick: action.onClick,
                        children: action.label
                    }, void 0, false, {
                        fileName: "[project]/apps/frontend/src/components/EmptyState.tsx",
                        lineNumber: 41,
                        columnNumber: 13
                    }, this),
                    secondaryAction && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                        variant: "secondary",
                        size: size === 'sm' ? 'sm' : 'md',
                        onClick: secondaryAction.onClick,
                        children: secondaryAction.label
                    }, void 0, false, {
                        fileName: "[project]/apps/frontend/src/components/EmptyState.tsx",
                        lineNumber: 46,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/frontend/src/components/EmptyState.tsx",
                lineNumber: 39,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/frontend/src/components/EmptyState.tsx",
        lineNumber: 24,
        columnNumber: 5
    }, this);
}
const EmptyIcons = {
    loans: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "24",
        height: "24",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                x: "2",
                y: "6",
                width: "20",
                height: "12",
                rx: "2"
            }, void 0, false, {
                fileName: "[project]/apps/frontend/src/components/EmptyState.tsx",
                lineNumber: 59,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M12 10v4M10 12h4",
                strokeLinecap: "round"
            }, void 0, false, {
                fileName: "[project]/apps/frontend/src/components/EmptyState.tsx",
                lineNumber: 60,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/apps/frontend/src/components/EmptyState.tsx",
        lineNumber: 58,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0)),
    transactions: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "24",
        height: "24",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.5",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
            d: "M7 16l-4-4 4-4M17 8l4 4-4 4M14 4l-4 16",
            strokeLinecap: "round",
            strokeLinejoin: "round"
        }, void 0, false, {
            fileName: "[project]/apps/frontend/src/components/EmptyState.tsx",
            lineNumber: 65,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/apps/frontend/src/components/EmptyState.tsx",
        lineNumber: 64,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0)),
    notifications: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "24",
        height: "24",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.5",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
            d: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0",
            strokeLinecap: "round",
            strokeLinejoin: "round"
        }, void 0, false, {
            fileName: "[project]/apps/frontend/src/components/EmptyState.tsx",
            lineNumber: 70,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/apps/frontend/src/components/EmptyState.tsx",
        lineNumber: 69,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0)),
    search: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "24",
        height: "24",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "11",
                cy: "11",
                r: "8"
            }, void 0, false, {
                fileName: "[project]/apps/frontend/src/components/EmptyState.tsx",
                lineNumber: 75,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M21 21l-4.35-4.35",
                strokeLinecap: "round"
            }, void 0, false, {
                fileName: "[project]/apps/frontend/src/components/EmptyState.tsx",
                lineNumber: 76,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/apps/frontend/src/components/EmptyState.tsx",
        lineNumber: 74,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0)),
    error: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "24",
        height: "24",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "12",
                cy: "12",
                r: "10"
            }, void 0, false, {
                fileName: "[project]/apps/frontend/src/components/EmptyState.tsx",
                lineNumber: 81,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M12 8v4M12 16h.01",
                strokeLinecap: "round"
            }, void 0, false, {
                fileName: "[project]/apps/frontend/src/components/EmptyState.tsx",
                lineNumber: 82,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/apps/frontend/src/components/EmptyState.tsx",
        lineNumber: 80,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0))
};
;
}),
"[project]/apps/frontend/src/components/Modal.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ConfirmModal",
    ()=>ConfirmModal,
    "Modal",
    ()=>Modal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/src/components/Button.tsx [app-ssr] (ecmascript)");
;
;
function Modal({ open, onClose, title, children, footer, size = 'md' }) {
    if (!open) return null;
    const widths = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg'
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-50 flex items-center justify-center p-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 bg-navy/50 backdrop-blur-[2px]",
                onClick: onClose
            }, void 0, false, {
                fileName: "[project]/apps/frontend/src/components/Modal.tsx",
                lineNumber: 20,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `relative z-10 bg-white border-[1.5px] border-navy shadow-nb-lg rounded-[8px] w-full ${widths[size]} flex flex-col`,
                role: "dialog",
                "aria-modal": "true",
                "aria-labelledby": "modal-title",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between px-5 pt-5 pb-4 border-b border-stone-200",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                id: "modal-title",
                                className: "text-base font-semibold text-navy",
                                children: title
                            }, void 0, false, {
                                fileName: "[project]/apps/frontend/src/components/Modal.tsx",
                                lineNumber: 31,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: onClose,
                                className: "w-7 h-7 flex items-center justify-center rounded-[4px] text-stone-400 hover:bg-stone-100 hover:text-navy transition-colors text-lg",
                                "aria-label": "Close",
                                type: "button",
                                children: "×"
                            }, void 0, false, {
                                fileName: "[project]/apps/frontend/src/components/Modal.tsx",
                                lineNumber: 32,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/frontend/src/components/Modal.tsx",
                        lineNumber: 30,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "px-5 py-4 overflow-y-auto",
                        children: children
                    }, void 0, false, {
                        fileName: "[project]/apps/frontend/src/components/Modal.tsx",
                        lineNumber: 41,
                        columnNumber: 9
                    }, this),
                    footer && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "px-5 pb-5 pt-2 flex items-center justify-end gap-2 border-t border-stone-200",
                        children: footer
                    }, void 0, false, {
                        fileName: "[project]/apps/frontend/src/components/Modal.tsx",
                        lineNumber: 43,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/frontend/src/components/Modal.tsx",
                lineNumber: 24,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/frontend/src/components/Modal.tsx",
        lineNumber: 19,
        columnNumber: 5
    }, this);
}
function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', variant = 'default', loading = false }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Modal, {
        open: open,
        onClose: onClose,
        title: title,
        size: "sm",
        footer: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                    variant: "ghost",
                    size: "sm",
                    onClick: onClose,
                    disabled: loading,
                    children: cancelLabel
                }, void 0, false, {
                    fileName: "[project]/apps/frontend/src/components/Modal.tsx",
                    lineNumber: 83,
                    columnNumber: 11
                }, void 0),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                    variant: variant === 'danger' ? 'destructive' : 'primary',
                    size: "sm",
                    onClick: onConfirm,
                    loading: loading,
                    children: confirmLabel
                }, void 0, false, {
                    fileName: "[project]/apps/frontend/src/components/Modal.tsx",
                    lineNumber: 84,
                    columnNumber: 11
                }, void 0)
            ]
        }, void 0, true),
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
            className: "text-sm text-stone-600 leading-relaxed",
            children: message
        }, void 0, false, {
            fileName: "[project]/apps/frontend/src/components/Modal.tsx",
            lineNumber: 95,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/frontend/src/components/Modal.tsx",
        lineNumber: 76,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/frontend/src/components/Progress.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MiniStepper",
    ()=>MiniStepper,
    "ProgressBar",
    ()=>ProgressBar,
    "Stepper",
    ()=>Stepper
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
;
const barColors = {
    teal: 'bg-teal',
    emerald: 'bg-emerald',
    coral: 'bg-coral',
    sky: 'bg-sky',
    yellow: 'bg-yellow'
};
const trackColors = {
    teal: 'bg-teal-light',
    emerald: 'bg-emerald-light',
    coral: 'bg-coral-light',
    sky: 'bg-sky-light',
    yellow: 'bg-yellow-light'
};
const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
};
function ProgressBar({ value, max = 100, label, showValue = false, size = 'md', color = 'teal', className = '' }) {
    const pct = Math.min(100, Math.max(0, value / max * 100));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `flex flex-col gap-1.5 ${className}`,
        children: [
            (label || showValue) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between",
                children: [
                    label && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xs font-medium text-stone-600",
                        children: label
                    }, void 0, false, {
                        fileName: "[project]/apps/frontend/src/components/Progress.tsx",
                        lineNumber: 44,
                        columnNumber: 21
                    }, this),
                    showValue && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xs font-mono-sr font-medium text-navy",
                        children: [
                            Math.round(pct),
                            "%"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/frontend/src/components/Progress.tsx",
                        lineNumber: 46,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/frontend/src/components/Progress.tsx",
                lineNumber: 43,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `w-full ${heights[size]} rounded-full ${trackColors[color]} border border-stone-200 overflow-hidden`,
                role: "progressbar",
                "aria-valuenow": value,
                "aria-valuemax": max,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: `h-full rounded-full ${barColors[color]} transition-all duration-500`,
                    style: {
                        width: `${pct}%`
                    }
                }, void 0, false, {
                    fileName: "[project]/apps/frontend/src/components/Progress.tsx",
                    lineNumber: 58,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/frontend/src/components/Progress.tsx",
                lineNumber: 52,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/frontend/src/components/Progress.tsx",
        lineNumber: 41,
        columnNumber: 5
    }, this);
}
function Stepper({ steps, currentStep, className = '' }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `flex items-start gap-0 ${className}`,
        children: steps.map((step, i)=>{
            const state = i < currentStep ? 'done' : i === currentStep ? 'active' : 'upcoming';
            const isLast = i === steps.length - 1;
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `flex flex-col items-center ${isLast ? '' : 'flex-1'}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center w-full",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `w-8 h-8 rounded-full border-[1.5px] flex items-center justify-center shrink-0 text-xs font-semibold transition-colors ${state === 'done' ? 'bg-teal border-teal text-white' : state === 'active' ? 'bg-white border-navy text-navy shadow-nb-xs' : 'bg-white border-stone-300 text-stone-400'}`,
                                children: state === 'done' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    width: "12",
                                    height: "10",
                                    viewBox: "0 0 12 10",
                                    fill: "none",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        d: "M1 5L4.5 8.5L11 1.5",
                                        stroke: "white",
                                        strokeWidth: "1.5",
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/frontend/src/components/Progress.tsx",
                                        lineNumber: 99,
                                        columnNumber: 21
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/apps/frontend/src/components/Progress.tsx",
                                    lineNumber: 98,
                                    columnNumber: 19
                                }, this) : i + 1
                            }, void 0, false, {
                                fileName: "[project]/apps/frontend/src/components/Progress.tsx",
                                lineNumber: 88,
                                columnNumber: 15
                            }, this),
                            !isLast && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `flex-1 h-[1.5px] mx-1 ${state === 'done' ? 'bg-teal' : 'bg-stone-200'}`
                            }, void 0, false, {
                                fileName: "[project]/apps/frontend/src/components/Progress.tsx",
                                lineNumber: 106,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/frontend/src/components/Progress.tsx",
                        lineNumber: 87,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-2 text-center max-w-[80px]",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: `text-xs font-medium leading-tight ${state === 'active' ? 'text-navy' : state === 'done' ? 'text-teal' : 'text-stone-400'}`,
                                children: step.label
                            }, void 0, false, {
                                fileName: "[project]/apps/frontend/src/components/Progress.tsx",
                                lineNumber: 112,
                                columnNumber: 15
                            }, this),
                            step.sublabel && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[10px] text-stone-400 mt-0.5 leading-tight",
                                children: step.sublabel
                            }, void 0, false, {
                                fileName: "[project]/apps/frontend/src/components/Progress.tsx",
                                lineNumber: 120,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/frontend/src/components/Progress.tsx",
                        lineNumber: 111,
                        columnNumber: 13
                    }, this)
                ]
            }, i, true, {
                fileName: "[project]/apps/frontend/src/components/Progress.tsx",
                lineNumber: 86,
                columnNumber: 11
            }, this);
        })
    }, void 0, false, {
        fileName: "[project]/apps/frontend/src/components/Progress.tsx",
        lineNumber: 80,
        columnNumber: 5
    }, this);
}
function MiniStepper({ total, current, label }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center gap-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex gap-1",
                children: Array.from({
                    length: total
                }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: `h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-5 bg-teal' : i < current ? 'w-1.5 bg-teal/40' : 'w-1.5 bg-stone-300'}`
                    }, i, false, {
                        fileName: "[project]/apps/frontend/src/components/Progress.tsx",
                        lineNumber: 141,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/apps/frontend/src/components/Progress.tsx",
                lineNumber: 139,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-xs text-stone-500",
                children: label ?? `Step ${current + 1} of ${total}`
            }, void 0, false, {
                fileName: "[project]/apps/frontend/src/components/Progress.tsx",
                lineNumber: 149,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/frontend/src/components/Progress.tsx",
        lineNumber: 138,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/frontend/src/lib/mock-data.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "activeLoan",
    ()=>activeLoan,
    "applications",
    ()=>applications,
    "educationArticles",
    ()=>educationArticles,
    "loanProducts",
    ()=>loanProducts,
    "repaymentSchedule",
    ()=>repaymentSchedule,
    "transactions",
    ()=>transactions
]);
const loanProducts = [
    {
        id: "lp-01",
        name: "Student Tuition Support Loan",
        provider: "Bengal Microfinance Bank",
        category: "education",
        minAmount: 20000,
        maxAmount: 500000,
        interestRate: 8,
        durationMonths: 48,
        description: "Cover tuition, books, and living costs while you study. Repayments begin six months after your course ends.",
        eligibility: [
            "Enrolled in a recognised institution",
            "Bangladeshi NID",
            "Guarantor required above ৳2,00,000"
        ],
        tags: [
            "No collateral",
            "Grace period",
            "Popular"
        ]
    },
    {
        id: "lp-02",
        name: "Emergency Medical Assistance",
        provider: "Shohoj Care Finance",
        category: "emergency",
        minAmount: 10000,
        maxAmount: 200000,
        interestRate: 10.5,
        durationMonths: 24,
        description: "Fast approval for urgent medical bills, hospital admissions, and critical treatment costs.",
        eligibility: [
            "Age 21–60",
            "Proof of income",
            "Hospital estimate or invoice"
        ],
        tags: [
            "24h approval",
            "No collateral"
        ]
    },
    {
        id: "lp-03",
        name: "Small Business Working Capital Facility",
        provider: "Dhaka Trade Credit",
        category: "business",
        minAmount: 50000,
        maxAmount: 1500000,
        interestRate: 12,
        durationMonths: 36,
        description: "Working capital and equipment financing for registered small businesses and shop owners.",
        eligibility: [
            "Trade licence",
            "12 months of trading history",
            "Bank statements"
        ],
        tags: [
            "Flexible tenure",
            "Business"
        ]
    },
    {
        id: "lp-04",
        name: "Skills & Professional Development Loan",
        provider: "Shohoj Learn Finance",
        category: "development",
        minAmount: 10000,
        maxAmount: 100000,
        interestRate: 9,
        durationMonths: 18,
        description: "Fund certifications, professional courses, and career training with small monthly instalments.",
        eligibility: [
            "Age 18+",
            "Course admission letter"
        ],
        tags: [
            "Low ticket",
            "Fast"
        ]
    },
    {
        id: "lp-05",
        name: "Personal Flexible Loan",
        provider: "Bengal Microfinance Bank",
        category: "personal",
        minAmount: 15000,
        maxAmount: 300000,
        interestRate: 11.25,
        durationMonths: 30,
        description: "A general-purpose loan with transparent pricing and no prepayment penalty.",
        eligibility: [
            "Salaried or self-employed",
            "Minimum monthly income ৳20,000"
        ],
        tags: [
            "No prepayment fee"
        ]
    },
    {
        id: "lp-06",
        name: "Rural Entrepreneur Growth Loan",
        provider: "Padma Rural Finance",
        category: "business",
        minAmount: 25000,
        maxAmount: 400000,
        interestRate: 10,
        durationMonths: 24,
        description: "Designed for rural micro-entrepreneurs expanding stock, tools, or storage capacity.",
        eligibility: [
            "Village business registration",
            "Community guarantor"
        ],
        tags: [
            "Community backed"
        ]
    }
];
const transactions = [
    {
        id: "t-1",
        date: "2026-07-15",
        description: "EMI payment — Student Tuition Support Loan",
        amount: 4500,
        type: "repayment",
        status: "completed"
    },
    {
        id: "t-2",
        date: "2026-06-15",
        description: "EMI payment — Student Tuition Support Loan",
        amount: 4500,
        type: "repayment",
        status: "completed"
    },
    {
        id: "t-3",
        date: "2026-06-02",
        description: "Late payment fee reversal (goodwill adjustment)",
        amount: 250,
        type: "refund",
        status: "completed"
    },
    {
        id: "t-4",
        date: "2026-05-15",
        description: "EMI payment — Student Tuition Support Loan",
        amount: 4500,
        type: "repayment",
        status: "completed"
    },
    {
        id: "t-5",
        date: "2026-05-01",
        description: "Processing fee — Emergency Medical Assistance application",
        amount: 750,
        type: "fee",
        status: "completed"
    },
    {
        id: "t-6",
        date: "2026-04-20",
        description: "Loan disbursement — Emergency Medical Assistance",
        amount: 60000,
        type: "disbursement",
        status: "completed"
    },
    {
        id: "t-7",
        date: "2026-04-15",
        description: "EMI payment — Student Tuition Support Loan",
        amount: 4500,
        type: "repayment",
        status: "failed"
    },
    {
        id: "t-8",
        date: "2026-03-15",
        description: "EMI payment — Student Tuition Support Loan",
        amount: 4500,
        type: "repayment",
        status: "completed"
    }
];
const repaymentSchedule = Array.from({
    length: 12
}, (_, i)=>{
    const month = i + 1;
    const status = month < 8 ? "paid" : month === 8 ? "due" : month === 7 ? "overdue" : "upcoming";
    return {
        month,
        dueDate: `2026-${String((month + 2) % 12 + 1).padStart(2, "0")}-15`,
        principal: 3080,
        interest: 1420,
        total: 4500,
        status
    };
});
const activeLoan = {
    id: "SR-2026-004812",
    name: "Student Tuition Support Loan",
    provider: "Bengal Microfinance Bank",
    principal: 200000,
    interestRate: 8.5,
    durationMonths: 48,
    paidMonths: 14,
    totalRepayable: 236000,
    amountRepaid: 63000,
    remainingBalance: 173000,
    interestPaid: 19880,
    feesPaid: 750,
    monthlyPayment: 4500,
    nextPaymentDate: "2026-08-15"
};
const applications = [
    {
        id: "APP-9021",
        product: "Emergency Medical Assistance",
        provider: "Shohoj Care Finance",
        amount: 60000,
        submitted: "2026-07-02",
        status: "under-review",
        stage: 2
    },
    {
        id: "APP-8877",
        product: "Small Business Working Capital Facility",
        provider: "Dhaka Trade Credit",
        amount: 450000,
        submitted: "2026-06-18",
        status: "info-required",
        stage: 2
    },
    {
        id: "APP-8420",
        product: "Student Tuition Support Loan",
        provider: "Bengal Microfinance Bank",
        amount: 200000,
        submitted: "2025-05-11",
        status: "disbursed",
        stage: 4
    },
    {
        id: "APP-8103",
        product: "Personal Flexible Loan",
        provider: "Bengal Microfinance Bank",
        amount: 120000,
        submitted: "2025-02-27",
        status: "rejected",
        stage: 3
    }
];
const educationArticles = [
    {
        id: "ed-1",
        title: "Understanding interest rates",
        tag: "Basics",
        read: "4 min read",
        desc: "How simple and compound interest change the total you repay — with worked examples in taka."
    },
    {
        id: "ed-2",
        title: "How loan repayment actually works",
        tag: "Repayment",
        read: "5 min read",
        desc: "EMIs, amortisation, and how each payment splits between principal and interest."
    },
    {
        id: "ed-3",
        title: "What affects the cost of your loan",
        tag: "Credit",
        read: "3 min read",
        desc: "Duration, amount, and credit history — the three factors that move your rate the most."
    },
    {
        id: "ed-4",
        title: "Building a repayment budget you can keep",
        tag: "Planning",
        read: "6 min read",
        desc: "A simple monthly framework so instalments never catch you by surprise."
    },
    {
        id: "ed-5",
        title: "Reading the fine print without fear",
        tag: "Basics",
        read: "4 min read",
        desc: "Processing fees, late charges, prepayment terms — what to check before signing."
    },
    {
        id: "ed-6",
        title: "What to do if you might miss a payment",
        tag: "Support",
        read: "5 min read",
        desc: "Restructuring, grace periods, and how to talk to your lender early."
    }
];
}),
"[project]/apps/frontend/src/lib/format.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/** Bangladeshi taka formatting, shared by every financial surface. */ __turbopack_context__.s([
    "formatDate",
    ()=>formatDate,
    "formatPercent",
    ()=>formatPercent,
    "formatTaka",
    ()=>formatTaka
]);
function formatTaka(amount, opts = {}) {
    const value = new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: opts.decimals ? 2 : 0,
        maximumFractionDigits: opts.decimals ? 2 : 0
    }).format(amount);
    return `৳${value}`;
}
function formatPercent(rate) {
    return `${rate}% p.a.`;
}
function formatDate(iso) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}
}),
"[project]/apps/frontend/src/views/ApplicationStatus.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ApplicationStatus
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$AppLayout$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/src/components/AppLayout.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$PageHeader$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/src/components/PageHeader.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/src/components/Card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$Tabs$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/src/components/Tabs.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$Badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/src/components/Badge.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$Alert$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/src/components/Alert.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$EmptyState$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/src/components/EmptyState.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$Modal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/src/components/Modal.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/src/components/Button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$Progress$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/src/components/Progress.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/src/lib/mock-data.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$lib$2f$format$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/src/lib/format.ts [app-ssr] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
;
;
;
const stageLabels = [
    'Submitted',
    'Under review',
    'Decision',
    'Disbursed'
];
function matchesFilter(status, filter) {
    if (filter === 'all') return true;
    if (filter === 'approved') return status === 'approved' || status === 'disbursed';
    if (filter === 'rejected') return status === 'rejected';
    return status === 'submitted' || status === 'under-review' || status === 'info-required';
}
function timelineFor(app) {
    const steps = [
        {
            label: 'Application submitted',
            date: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$lib$2f$format$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatDate"])(app.submitted),
            done: true
        },
        {
            label: 'Under review by ' + app.provider,
            date: app.stage >= 2 ? 'In progress' : 'Pending',
            done: app.stage >= 2
        },
        {
            label: app.status === 'rejected' ? 'Application rejected' : 'Decision made',
            date: app.stage >= 3 ? 'Completed' : 'Pending',
            done: app.stage >= 3
        },
        {
            label: 'Funds disbursed',
            date: app.stage >= 4 ? 'Completed' : 'Pending',
            done: app.stage >= 4
        }
    ];
    return steps;
}
function ApplicationStatus({ onNavigate }) {
    const [filter, setFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('all');
    const [selectedId, setSelectedId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const filtered = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["applications"].filter((a)=>matchesFilter(a.status, filter));
    const selected = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["applications"].find((a)=>a.id === selectedId) ?? null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$AppLayout$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AppLayout"], {
        onNavigate: onNavigate,
        currentPage: "application-status",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-w-4xl mx-auto px-4 md:px-6 py-6",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$PageHeader$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PageHeader"], {
                    title: "My applications",
                    description: "Track every loan application from submission to disbursement.",
                    actions: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                        variant: "primary",
                        size: "sm",
                        onClick: ()=>onNavigate('loan-marketplace'),
                        children: "+ New application"
                    }, void 0, false, {
                        fileName: "[project]/apps/frontend/src/views/ApplicationStatus.tsx",
                        lineNumber: 58,
                        columnNumber: 20
                    }, void 0)
                }, void 0, false, {
                    fileName: "[project]/apps/frontend/src/views/ApplicationStatus.tsx",
                    lineNumber: 55,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$Tabs$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Tabs"], {
                    className: "mb-5",
                    variant: "pill",
                    tabs: [
                        {
                            id: 'all',
                            label: 'All',
                            count: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["applications"].length
                        },
                        {
                            id: 'in-progress',
                            label: 'In progress',
                            count: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["applications"].filter((a)=>matchesFilter(a.status, 'in-progress')).length
                        },
                        {
                            id: 'approved',
                            label: 'Approved',
                            count: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["applications"].filter((a)=>matchesFilter(a.status, 'approved')).length
                        },
                        {
                            id: 'rejected',
                            label: 'Rejected',
                            count: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["applications"].filter((a)=>matchesFilter(a.status, 'rejected')).length
                        }
                    ],
                    activeTab: filter,
                    onChange: (id)=>setFilter(id)
                }, void 0, false, {
                    fileName: "[project]/apps/frontend/src/views/ApplicationStatus.tsx",
                    lineNumber: 61,
                    columnNumber: 9
                }, this),
                filtered.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Card"], {
                    variant: "plain",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$EmptyState$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EmptyState"], {
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$EmptyState$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EmptyIcons"].search,
                        title: "No applications here",
                        description: "Try a different filter, or start a new loan application.",
                        action: {
                            label: 'Explore loans',
                            onClick: ()=>onNavigate('loan-marketplace')
                        }
                    }, void 0, false, {
                        fileName: "[project]/apps/frontend/src/views/ApplicationStatus.tsx",
                        lineNumber: 76,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/frontend/src/views/ApplicationStatus.tsx",
                    lineNumber: 75,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-4",
                    children: filtered.map((app)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Card"], {
                            variant: "plain",
                            className: "p-4 sm:p-5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-[minmax(0,1fr)_auto] gap-4 sm:flex sm:justify-between sm:items-start",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "min-w-0",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-base font-semibold text-navy truncate",
                                                    children: app.product
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/frontend/src/views/ApplicationStatus.tsx",
                                                    lineNumber: 89,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm text-stone-500 truncate",
                                                    children: app.provider
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/frontend/src/views/ApplicationStatus.tsx",
                                                    lineNumber: 90,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs font-mono-sr text-stone-400 mt-1",
                                                    children: [
                                                        app.id,
                                                        " · Submitted ",
                                                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$lib$2f$format$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatDate"])(app.submitted)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/apps/frontend/src/views/ApplicationStatus.tsx",
                                                    lineNumber: 91,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/apps/frontend/src/views/ApplicationStatus.tsx",
                                            lineNumber: 88,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "shrink-0 flex flex-col items-end gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$Badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AppStatusBadge"], {
                                                    status: app.status
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/frontend/src/views/ApplicationStatus.tsx",
                                                    lineNumber: 94,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "font-mono-sr text-sm font-semibold text-navy",
                                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$lib$2f$format$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatTaka"])(app.amount)
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/frontend/src/views/ApplicationStatus.tsx",
                                                    lineNumber: 95,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/apps/frontend/src/views/ApplicationStatus.tsx",
                                            lineNumber: 93,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/frontend/src/views/ApplicationStatus.tsx",
                                    lineNumber: 87,
                                    columnNumber: 17
                                }, this),
                                app.status === 'info-required' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$Alert$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Alert"], {
                                    variant: "warning",
                                    title: "Additional information needed",
                                    className: "mt-4",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: [
                                                    app.provider,
                                                    " needs an updated bank statement to continue reviewing this application."
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/frontend/src/views/ApplicationStatus.tsx",
                                                lineNumber: 102,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                                variant: "secondary",
                                                size: "xs",
                                                className: "shrink-0",
                                                onClick: ()=>setSelectedId(app.id),
                                                children: "Submit documents"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/frontend/src/views/ApplicationStatus.tsx",
                                                lineNumber: 103,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/frontend/src/views/ApplicationStatus.tsx",
                                        lineNumber: 101,
                                        columnNumber: 21
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/apps/frontend/src/views/ApplicationStatus.tsx",
                                    lineNumber: 100,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-5 overflow-x-auto",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$Progress$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Stepper"], {
                                        steps: stageLabels.map((l)=>({
                                                label: l
                                            })),
                                        currentStep: app.stage - 1
                                    }, void 0, false, {
                                        fileName: "[project]/apps/frontend/src/views/ApplicationStatus.tsx",
                                        lineNumber: 111,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/apps/frontend/src/views/ApplicationStatus.tsx",
                                    lineNumber: 110,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-4 pt-3 border-t border-stone-100 flex justify-end",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: "text-xs text-teal hover:underline",
                                        onClick: ()=>setSelectedId(app.id),
                                        children: "View timeline"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/frontend/src/views/ApplicationStatus.tsx",
                                        lineNumber: 115,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/apps/frontend/src/views/ApplicationStatus.tsx",
                                    lineNumber: 114,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, app.id, true, {
                            fileName: "[project]/apps/frontend/src/views/ApplicationStatus.tsx",
                            lineNumber: 86,
                            columnNumber: 15
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/apps/frontend/src/views/ApplicationStatus.tsx",
                    lineNumber: 84,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$Modal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Modal"], {
                    open: !!selected,
                    onClose: ()=>setSelectedId(null),
                    title: selected ? `${selected.product} — timeline` : '',
                    footer: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                        variant: "secondary",
                        size: "sm",
                        onClick: ()=>setSelectedId(null),
                        children: "Close"
                    }, void 0, false, {
                        fileName: "[project]/apps/frontend/src/views/ApplicationStatus.tsx",
                        lineNumber: 132,
                        columnNumber: 19
                    }, void 0),
                    children: selected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "min-w-0",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-stone-500",
                                                children: selected.provider
                                            }, void 0, false, {
                                                fileName: "[project]/apps/frontend/src/views/ApplicationStatus.tsx",
                                                lineNumber: 138,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm font-mono-sr text-stone-400",
                                                children: selected.id
                                            }, void 0, false, {
                                                fileName: "[project]/apps/frontend/src/views/ApplicationStatus.tsx",
                                                lineNumber: 139,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/frontend/src/views/ApplicationStatus.tsx",
                                        lineNumber: 137,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$Badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AppStatusBadge"], {
                                        status: selected.status
                                    }, void 0, false, {
                                        fileName: "[project]/apps/frontend/src/views/ApplicationStatus.tsx",
                                        lineNumber: 141,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/frontend/src/views/ApplicationStatus.tsx",
                                lineNumber: 136,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ol", {
                                className: "flex flex-col gap-3",
                                children: timelineFor(selected).map((step, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        className: "flex items-start gap-3",
                                        "aria-current": !step.done && i === selected.stage - 1 ? 'step' : undefined,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: `w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${step.done ? 'bg-teal' : 'bg-stone-300'}`
                                            }, void 0, false, {
                                                fileName: "[project]/apps/frontend/src/views/ApplicationStatus.tsx",
                                                lineNumber: 146,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "min-w-0",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: `text-sm font-medium ${step.done ? 'text-navy' : 'text-stone-400'}`,
                                                        children: step.label
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/frontend/src/views/ApplicationStatus.tsx",
                                                        lineNumber: 148,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-stone-400",
                                                        children: step.date
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/frontend/src/views/ApplicationStatus.tsx",
                                                        lineNumber: 149,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/frontend/src/views/ApplicationStatus.tsx",
                                                lineNumber: 147,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, i, true, {
                                        fileName: "[project]/apps/frontend/src/views/ApplicationStatus.tsx",
                                        lineNumber: 145,
                                        columnNumber: 19
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/apps/frontend/src/views/ApplicationStatus.tsx",
                                lineNumber: 143,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/frontend/src/views/ApplicationStatus.tsx",
                        lineNumber: 135,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/frontend/src/views/ApplicationStatus.tsx",
                    lineNumber: 128,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/frontend/src/views/ApplicationStatus.tsx",
            lineNumber: 54,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/frontend/src/views/ApplicationStatus.tsx",
        lineNumber: 53,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/frontend/src/lib/navigation.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PAGE_LABELS",
    ()=>PAGE_LABELS,
    "PAGE_ROUTES",
    ()=>PAGE_ROUTES,
    "useAppNavigate",
    ()=>useAppNavigate
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
;
;
const PAGE_ROUTES = {
    landing: "/",
    auth: "/auth",
    onboarding: "/onboarding",
    "borrower-dashboard": "/dashboard",
    "loan-marketplace": "/loans",
    "loan-details": "/loans/details",
    "loan-application": "/apply",
    "application-status": "/applications",
    "active-loan": "/my-loans",
    repayment: "/repayment",
    education: "/learn",
    "lender-dashboard": "/lender",
    admin: "/admin",
    "system-states": "/system-states"
};
const PAGE_LABELS = {
    landing: "Home",
    auth: "Log in / Register",
    onboarding: "Onboarding",
    "borrower-dashboard": "Borrower Dashboard",
    "loan-marketplace": "Loan Marketplace",
    "loan-details": "Loan Details",
    "loan-application": "Loan Application",
    "application-status": "Application Status",
    "active-loan": "Active Loan",
    repayment: "Repayment",
    education: "Financial Education",
    "lender-dashboard": "Lender Dashboard",
    admin: "Admin Dashboard",
    "system-states": "System States"
};
function useAppNavigate() {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((page)=>{
        router.push(PAGE_ROUTES[page]);
    }, [
        router
    ]);
}
}),
"[project]/apps/frontend/src/app/applications/page.client.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ApplicationsPageClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$views$2f$ApplicationStatus$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/src/views/ApplicationStatus.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$lib$2f$navigation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/src/lib/navigation.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
function ApplicationsPageClient() {
    const navigate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$lib$2f$navigation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppNavigate"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$views$2f$ApplicationStatus$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
        onNavigate: navigate
    }, void 0, false, {
        fileName: "[project]/apps/frontend/src/app/applications/page.client.tsx",
        lineNumber: 8,
        columnNumber: 10
    }, this);
}
}),
];

//# sourceMappingURL=apps_frontend_src_5f9b1a4b._.js.map