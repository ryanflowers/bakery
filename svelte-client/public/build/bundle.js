
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                if (info.blocks[i] === block) {
                                    info.blocks[i] = null;
                                }
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }
    function update_await_block_branch(info, ctx, dirty) {
        const child_ctx = ctx.slice();
        const { resolved } = info;
        if (info.current === info.then) {
            child_ctx[info.value] = resolved;
        }
        if (info.current === info.catch) {
            child_ctx[info.error] = resolved;
        }
        info.block.p(child_ctx, dirty);
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.1' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const getCatelog = () =>
      fetch("http://localhost:3001/api/catelog").then((res) =>
        res.json().then((result) => JSON.parse(result.message))
      );

    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    });

    const formatIntToUSD = (num) => formatter.format(num / 100);

    /* src/ItemVariationList.svelte generated by Svelte v3.44.1 */
    const file$4 = "src/ItemVariationList.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (63:0) {:else}
    function create_else_block$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("No items found");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(63:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (46:0) {#if variations.length}
    function create_if_block$1(ctx) {
    	let each_1_anchor;
    	let each_value = /*variations*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*onItemClicked, variations, formatIntToUSD, toImageSrc*/ 7) {
    				each_value = /*variations*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(46:0) {#if variations.length}",
    		ctx
    	});

    	return block;
    }

    // (47:2) {#each variations as variation}
    function create_each_block$2(ctx) {
    	let div2;
    	let img;
    	let img_src_value;
    	let t0;
    	let div0;
    	let t1_value = /*variation*/ ctx[5].item_variation_data.name + "";
    	let t1;
    	let t2;
    	let div1;
    	let t3_value = formatIntToUSD(/*variation*/ ctx[5].item_variation_data.price_money.amount) + "";
    	let t3;
    	let t4;
    	let button;
    	let t6;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[3](/*variation*/ ctx[5]);
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			t1 = text(t1_value);
    			t2 = space();
    			div1 = element("div");
    			t3 = text(t3_value);
    			t4 = space();
    			button = element("button");
    			button.textContent = "Add To Cart";
    			t6 = space();
    			attr_dev(img, "alt", "item");
    			if (!src_url_equal(img.src, img_src_value = /*toImageSrc*/ ctx[2](/*variation*/ ctx[5].item_variation_data.item_id))) attr_dev(img, "src", img_src_value);
    			add_location(img, file$4, 48, 6, 2170);
    			attr_dev(div0, "class", "name");
    			add_location(div0, file$4, 49, 6, 2251);
    			attr_dev(div1, "class", "price");
    			add_location(div1, file$4, 50, 6, 2318);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "add");
    			add_location(button, file$4, 53, 6, 2432);
    			attr_dev(div2, "class", "item-variant");
    			add_location(div2, file$4, 47, 4, 2137);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, img);
    			append_dev(div2, t0);
    			append_dev(div2, div0);
    			append_dev(div0, t1);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, t3);
    			append_dev(div2, t4);
    			append_dev(div2, button);
    			append_dev(div2, t6);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*variations*/ 2 && !src_url_equal(img.src, img_src_value = /*toImageSrc*/ ctx[2](/*variation*/ ctx[5].item_variation_data.item_id))) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*variations*/ 2 && t1_value !== (t1_value = /*variation*/ ctx[5].item_variation_data.name + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*variations*/ 2 && t3_value !== (t3_value = formatIntToUSD(/*variation*/ ctx[5].item_variation_data.price_money.amount) + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(47:2) {#each variations as variation}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*variations*/ ctx[1].length) return create_if_block$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ItemVariationList', slots, []);

    	const catelogItemImageMap = new Map([
    			[
    				"2VWDQBWU5MTGHHXEJJKVSRMB",
    				"https://www.vermontcountrystore.com/ccstore/v1/images/?source=/file/v4513665367241151130/products/79128.01.xmas.png&height=940&width=940&quality=0.8&outputFormat=JPEG"
    			],
    			[
    				"LA7JLPQCYIOEX6H4JYIP7I2J",
    				"https://www.vermontcountrystore.com/ccstore/v1/images/?source=/file/v6094482156140772220/products/83851.main.png&height=940&width=940&quality=0.8&outputFormat=JPEG"
    			],
    			[
    				"EY7GSDQR3YTT3WGYF4ONSLGW",
    				"https://www.vermontcountrystore.com/ccstore/v1/images/?source=/file/v3919668293474871955/products/64021.01.png&height=940&width=940&quality=0.8&outputFormat=JPEG"
    			],
    			[
    				"HYTZOZZKS627DNV4RZ2IKO6S",
    				"https://www.vermontcountrystore.com/ccstore/v1/images/?source=/file/v3586934744430991263/products/76650.01.png&height=940&width=940&quality=0.8&outputFormat=JPEG"
    			],
    			[
    				"SAIY2JRANQ36GFOFOVZSHEPE",
    				"https://www.vermontcountrystore.com/ccstore/v1/images/?source=/file/v4513665367241151130/products/79128.01.xmas.png&height=940&width=940&quality=0.8&outputFormat=JPEG"
    			],
    			[
    				"XTUOCKFGBR42S5W7VLYX4SLE",
    				"https://www.vermontcountrystore.com/ccstore/v1/images/?source=/file/v6094482156140772220/products/83851.main.png&height=940&width=940&quality=0.8&outputFormat=JPEG"
    			],
    			[
    				"HIFNMJZMC6OSJBR5MOOJXHGN",
    				"https://www.vermontcountrystore.com/ccstore/v1/images/?source=/file/v8025209435824385631/products/78862..02.png&height=940&width=940&quality=0.8&outputFormat=JPEG"
    			],
    			[
    				"R6PGZUNDVSRYJVBCA76ZAGP5",
    				"https://www.vermontcountrystore.com/ccstore/v1/images/?source=/file/v6545877172631681355/products/72406.01.png&height=940&width=940&quality=0.8&outputFormat=JPEG"
    			]
    		]);

    	const toImageSrc = key => catelogItemImageMap.get(key);

    	let { onItemClicked = () => {

    	} } = $$props;

    	let { variations = [] } = $$props;
    	const writable_props = ['onItemClicked', 'variations'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ItemVariationList> was created with unknown prop '${key}'`);
    	});

    	const click_handler = variation => onItemClicked(variation);

    	$$self.$$set = $$props => {
    		if ('onItemClicked' in $$props) $$invalidate(0, onItemClicked = $$props.onItemClicked);
    		if ('variations' in $$props) $$invalidate(1, variations = $$props.variations);
    	};

    	$$self.$capture_state = () => ({
    		formatIntToUSD,
    		catelogItemImageMap,
    		toImageSrc,
    		onItemClicked,
    		variations
    	});

    	$$self.$inject_state = $$props => {
    		if ('onItemClicked' in $$props) $$invalidate(0, onItemClicked = $$props.onItemClicked);
    		if ('variations' in $$props) $$invalidate(1, variations = $$props.variations);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [onItemClicked, variations, toImageSrc, click_handler];
    }

    class ItemVariationList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { onItemClicked: 0, variations: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ItemVariationList",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get onItemClicked() {
    		throw new Error("<ItemVariationList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onItemClicked(value) {
    		throw new Error("<ItemVariationList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get variations() {
    		throw new Error("<ItemVariationList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set variations(value) {
    		throw new Error("<ItemVariationList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/CatelogList.svelte generated by Svelte v3.44.1 */
    const file$3 = "src/CatelogList.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (7:0) {#each items as item}
    function create_each_block$1(ctx) {
    	let div2;
    	let div0;
    	let t0_value = /*item*/ ctx[2].item_data.name + "";
    	let t0;
    	let t1;
    	let div1;
    	let t2_value = /*item*/ ctx[2].item_data.description + "";
    	let t2;
    	let t3;
    	let br;
    	let t4;
    	let itemvariationlist;
    	let t5;
    	let current;

    	itemvariationlist = new ItemVariationList({
    			props: {
    				onItemClicked: /*onItemClicked*/ ctx[1],
    				variations: /*item*/ ctx[2].item_data.variations
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			t2 = text(t2_value);
    			t3 = space();
    			br = element("br");
    			t4 = space();
    			create_component(itemvariationlist.$$.fragment);
    			t5 = space();
    			attr_dev(div0, "class", "name");
    			add_location(div0, file$3, 8, 4, 198);
    			add_location(div1, file$3, 9, 4, 248);
    			add_location(br, file$3, 10, 4, 292);
    			attr_dev(div2, "class", "list-item");
    			add_location(div2, file$3, 7, 2, 170);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, t2);
    			append_dev(div2, t3);
    			append_dev(div2, br);
    			append_dev(div2, t4);
    			mount_component(itemvariationlist, div2, null);
    			append_dev(div2, t5);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*items*/ 1) && t0_value !== (t0_value = /*item*/ ctx[2].item_data.name + "")) set_data_dev(t0, t0_value);
    			if ((!current || dirty & /*items*/ 1) && t2_value !== (t2_value = /*item*/ ctx[2].item_data.description + "")) set_data_dev(t2, t2_value);
    			const itemvariationlist_changes = {};
    			if (dirty & /*onItemClicked*/ 2) itemvariationlist_changes.onItemClicked = /*onItemClicked*/ ctx[1];
    			if (dirty & /*items*/ 1) itemvariationlist_changes.variations = /*item*/ ctx[2].item_data.variations;
    			itemvariationlist.$set(itemvariationlist_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(itemvariationlist.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(itemvariationlist.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(itemvariationlist);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(7:0) {#each items as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*items*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*onItemClicked, items*/ 3) {
    				each_value = /*items*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CatelogList', slots, []);
    	let { items = [] } = $$props;

    	let { onItemClicked = () => {

    	} } = $$props;

    	const writable_props = ['items', 'onItemClicked'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CatelogList> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('items' in $$props) $$invalidate(0, items = $$props.items);
    		if ('onItemClicked' in $$props) $$invalidate(1, onItemClicked = $$props.onItemClicked);
    	};

    	$$self.$capture_state = () => ({ ItemVariationList, items, onItemClicked });

    	$$self.$inject_state = $$props => {
    		if ('items' in $$props) $$invalidate(0, items = $$props.items);
    		if ('onItemClicked' in $$props) $$invalidate(1, onItemClicked = $$props.onItemClicked);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [items, onItemClicked];
    }

    class CatelogList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { items: 0, onItemClicked: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CatelogList",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get items() {
    		throw new Error("<CatelogList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<CatelogList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onItemClicked() {
    		throw new Error("<CatelogList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onItemClicked(value) {
    		throw new Error("<CatelogList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const API = "http://localhost:3001/api";
    const locationId$1 = "LCHG32HK18R8J";

    const createPayment = async (paymentMethod) => {
      const token = await tokenize(paymentMethod);
      return postPayment(token);
    };

    const postPayment = (token) => {
      const body = JSON.stringify({
        locationId: locationId$1,
        sourceId: token,
      });

      return fetch(`${API}/payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body,
      });
    };

    const tokenize = async (paymentMethod) => {
      const tokenResult = await paymentMethod.tokenize();
      if (tokenResult.status === "OK") {
        return tokenResult.token;
      } else {
        let errorMessage = `Tokenization failed with status: ${tokenResult.status}`;
        if (tokenResult.errors) {
          errorMessage += ` and errors: ${JSON.stringify(tokenResult.errors)}`;
        }

        throw new Error(errorMessage);
      }
    };

    /* src/Card.svelte generated by Svelte v3.44.1 */

    const { console: console_1 } = globals;
    const file$2 = "src/Card.svelte";

    function create_fragment$2(ctx) {
    	let form;
    	let div0;
    	let t0;
    	let button;
    	let t1;
    	let t2_value = formatIntToUSD(/*amount*/ ctx[0]) + "";
    	let t2;
    	let t3;
    	let div1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			form = element("form");
    			div0 = element("div");
    			t0 = space();
    			button = element("button");
    			t1 = text("Pay\n    ");
    			t2 = text(t2_value);
    			t3 = space();
    			div1 = element("div");
    			attr_dev(div0, "id", "card-container");
    			add_location(div0, file$2, 82, 2, 2139);
    			attr_dev(button, "id", "card-button");
    			attr_dev(button, "type", "button");
    			add_location(button, file$2, 83, 2, 2169);
    			attr_dev(form, "id", "payment-form");
    			add_location(form, file$2, 81, 0, 2112);
    			attr_dev(div1, "id", "payment-status-container");
    			add_location(div1, file$2, 93, 0, 2349);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, div0);
    			append_dev(form, t0);
    			append_dev(form, button);
    			append_dev(button, t1);
    			append_dev(button, t2);
    			/*button_binding*/ ctx[4](button);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div1, anchor);
    			/*div1_binding*/ ctx[5](div1);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*handlePaymentMethodSubmission*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*amount*/ 1 && t2_value !== (t2_value = formatIntToUSD(/*amount*/ ctx[0]) + "")) set_data_dev(t2, t2_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			/*button_binding*/ ctx[4](null);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div1);
    			/*div1_binding*/ ctx[5](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const appId = "sandbox-sq0idb-qye2EIz2rpQMlGLZ4wQ6nQ";
    const locationId = "LCHG32HK18R8J";

    async function initializeCard(payments) {
    	const card = await payments.card();

    	// Note a fan of this. Attach should take a reference to an element not pay query for me
    	await card.attach("#card-container");

    	return card;
    }

    // status is either SUCCESS or FAILURE;
    function displayPaymentResults(cardStatus, status) {
    	if (status === "SUCCESS") {
    		cardStatus.classList.remove("is-failure");
    		cardStatus.classList.add("is-success");
    	} else {
    		cardState;
    		cardStatus.classList.remove("is-success");
    		cardStatus.classList.add("is-failure");
    	}

    	cardStatus.style.visibility = "visible";
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Card', slots, []);
    	let { amount = 0 } = $$props;
    	let cardButton = null;
    	let cardStatus = null;
    	let card = null;

    	async function handlePaymentMethodSubmission(event) {
    		event.preventDefault();

    		try {
    			// disable the submit button as we await tokenization and make a payment request.
    			$$invalidate(1, cardButton.disabled = true, cardButton);

    			const paymentResults = await createPayment(card);
    			displayPaymentResults(cardStatus, "SUCCESS");
    			$$invalidate(1, cardButton.disabled = false, cardButton);
    			console.debug("Payment Success", paymentResults);
    		} catch(e) {
    			$$invalidate(1, cardButton.disabled = false, cardButton);
    			displayPaymentResults(cardStatus, "FAILURE");
    			console.error(e.message);
    			throw e;
    		}
    	}

    	onMount(async () => {
    		if (!window.Square) {
    			// Set state
    			console.error("Square.js failed to load properly");

    			return;
    		}

    		// Show the card
    		let payments;

    		try {
    			payments = window.Square.payments(appId, locationId);
    		} catch(e) {
    			$$invalidate(2, cardStatus.className = "missing-credentials", cardStatus);
    			$$invalidate(2, cardStatus.style.visibility = "visible", cardStatus);
    			return;
    		}

    		try {
    			card = await initializeCard(payments);
    		} catch(e) {
    			console.error("Initializing Card failed", e);
    			return;
    		}
    	});

    	const writable_props = ['amount'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Card> was created with unknown prop '${key}'`);
    	});

    	function button_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			cardButton = $$value;
    			$$invalidate(1, cardButton);
    		});
    	}

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			cardStatus = $$value;
    			$$invalidate(2, cardStatus);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('amount' in $$props) $$invalidate(0, amount = $$props.amount);
    	};

    	$$self.$capture_state = () => ({
    		amount,
    		formatIntToUSD,
    		createPayment,
    		onMount,
    		appId,
    		locationId,
    		cardButton,
    		cardStatus,
    		card,
    		initializeCard,
    		handlePaymentMethodSubmission,
    		displayPaymentResults
    	});

    	$$self.$inject_state = $$props => {
    		if ('amount' in $$props) $$invalidate(0, amount = $$props.amount);
    		if ('cardButton' in $$props) $$invalidate(1, cardButton = $$props.cardButton);
    		if ('cardStatus' in $$props) $$invalidate(2, cardStatus = $$props.cardStatus);
    		if ('card' in $$props) card = $$props.card;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		amount,
    		cardButton,
    		cardStatus,
    		handlePaymentMethodSubmission,
    		button_binding,
    		div1_binding
    	];
    }

    class Card extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { amount: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Card",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get amount() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set amount(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const createOrder = (items) =>
      fetch("http://localhost:3001/api/createOrder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lineItems: items, state: "OPEN" }),
      }).then((res) => res.json());

    /* src/Cart.svelte generated by Svelte v3.44.1 */
    const file$1 = "src/Cart.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (33:6) {:else}
    function create_else_block(ctx) {
    	let div;

    	function select_block_type_1(ctx, dirty) {
    		if (/*order*/ ctx[1]) return create_if_block_3;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "summary");
    			add_location(div, file$1, 33, 8, 835);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(33:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (22:6) {#if items.length > 0}
    function create_if_block_2(ctx) {
    	let div;
    	let each_value = /*items*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "cart-item");
    			add_location(div, file$1, 22, 8, 493);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*formatIntToUSD, items*/ 1) {
    				each_value = /*items*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(22:6) {#if items.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (48:10) {:else}
    function create_else_block_1(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Cart is empty";
    			add_location(span, file$1, 48, 12, 1292);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(48:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (35:10) {#if order}
    function create_if_block_3(ctx) {
    	let div2;
    	let div0;
    	let t0;
    	let span0;
    	let t1_value = formatIntToUSD(/*order*/ ctx[1].total_money.amount) + "";
    	let t1;
    	let t2;
    	let div1;
    	let t3;
    	let span1;
    	let t4_value = /*order*/ ctx[1].id + "";
    	let t4;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text("Total:\n                ");
    			span0 = element("span");
    			t1 = text(t1_value);
    			t2 = space();
    			div1 = element("div");
    			t3 = text("OID:\n                ");
    			span1 = element("span");
    			t4 = text(t4_value);
    			attr_dev(span0, "class", "price");
    			add_location(span0, file$1, 38, 16, 995);
    			attr_dev(div0, "class", "total");
    			add_location(div0, file$1, 36, 14, 936);
    			add_location(span1, file$1, 44, 16, 1198);
    			attr_dev(div1, "class", "order-info");
    			add_location(div1, file$1, 42, 14, 1136);
    			attr_dev(div2, "class", "summary-cotainer");
    			add_location(div2, file$1, 35, 12, 891);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div0, span0);
    			append_dev(span0, t1);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, t3);
    			append_dev(div1, span1);
    			append_dev(span1, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*order*/ 2 && t1_value !== (t1_value = formatIntToUSD(/*order*/ ctx[1].total_money.amount) + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*order*/ 2 && t4_value !== (t4_value = /*order*/ ctx[1].id + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(35:10) {#if order}",
    		ctx
    	});

    	return block;
    }

    // (24:10) {#each items as item}
    function create_each_block(ctx) {
    	let div;
    	let span0;
    	let t0_value = /*item*/ ctx[4].item_variation_data.name + "";
    	let t0;
    	let t1;
    	let span1;
    	let t2_value = formatIntToUSD(/*item*/ ctx[4].item_variation_data.price_money.amount) + "";
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span0 = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			span1 = element("span");
    			t2 = text(t2_value);
    			t3 = space();
    			add_location(span0, file$1, 25, 14, 581);
    			attr_dev(span1, "class", "price");
    			add_location(span1, file$1, 26, 14, 640);
    			add_location(div, file$1, 24, 12, 561);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span0);
    			append_dev(span0, t0);
    			append_dev(div, t1);
    			append_dev(div, span1);
    			append_dev(span1, t2);
    			append_dev(div, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*items*/ 1 && t0_value !== (t0_value = /*item*/ ctx[4].item_variation_data.name + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*items*/ 1 && t2_value !== (t2_value = formatIntToUSD(/*item*/ ctx[4].item_variation_data.price_money.amount) + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(24:10) {#each items as item}",
    		ctx
    	});

    	return block;
    }

    // (56:2) {#if items.length > 0}
    function create_if_block_1(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Checkout";
    			attr_dev(button, "type", "button");
    			add_location(button, file$1, 56, 4, 1412);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*onCheckout*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(56:2) {#if items.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (60:2) {#if order}
    function create_if_block(ctx) {
    	let div;
    	let card;
    	let current;

    	card = new Card({
    			props: {
    				amount: /*order*/ ctx[1].total_money.amount
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(card.$$.fragment);
    			add_location(div, file$1, 60, 4, 1501);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(card, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const card_changes = {};
    			if (dirty & /*order*/ 2) card_changes.amount = /*order*/ ctx[1].total_money.amount;
    			card.$set(card_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(card);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(60:2) {#if order}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div2;
    	let div1;
    	let label;
    	let t1;
    	let div0;
    	let t2;
    	let t3;
    	let current;

    	function select_block_type(ctx, dirty) {
    		if (/*items*/ ctx[0].length > 0) return create_if_block_2;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = /*items*/ ctx[0].length > 0 && create_if_block_1(ctx);
    	let if_block2 = /*order*/ ctx[1] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			label = element("label");
    			label.textContent = "Cart";
    			t1 = space();
    			div0 = element("div");
    			if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			if (if_block2) if_block2.c();
    			add_location(label, file$1, 19, 4, 408);
    			attr_dev(div0, "class", "cart-list");
    			add_location(div0, file$1, 20, 4, 432);
    			attr_dev(div1, "class", "cart-container");
    			add_location(div1, file$1, 18, 2, 375);
    			attr_dev(div2, "class", "cart");
    			add_location(div2, file$1, 17, 0, 354);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, label);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			if_block0.m(div0, null);
    			append_dev(div2, t2);
    			if (if_block1) if_block1.m(div2, null);
    			append_dev(div2, t3);
    			if (if_block2) if_block2.m(div2, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div0, null);
    				}
    			}

    			if (/*items*/ ctx[0].length > 0) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					if_block1.m(div2, t3);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*order*/ ctx[1]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*order*/ 2) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div2, null);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Cart', slots, []);
    	let { items = [] } = $$props;

    	let { onClearCart = () => {

    	} } = $$props;

    	let onCheckout = async () => {
    		const result = await createOrder(items);
    		$$invalidate(1, order = result.order);
    		onClearCart();
    	};

    	let order = null;
    	const writable_props = ['items', 'onClearCart'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Cart> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('items' in $$props) $$invalidate(0, items = $$props.items);
    		if ('onClearCart' in $$props) $$invalidate(3, onClearCart = $$props.onClearCart);
    	};

    	$$self.$capture_state = () => ({
    		Card,
    		createOrder,
    		formatIntToUSD,
    		items,
    		onClearCart,
    		onCheckout,
    		order
    	});

    	$$self.$inject_state = $$props => {
    		if ('items' in $$props) $$invalidate(0, items = $$props.items);
    		if ('onClearCart' in $$props) $$invalidate(3, onClearCart = $$props.onClearCart);
    		if ('onCheckout' in $$props) $$invalidate(2, onCheckout = $$props.onCheckout);
    		if ('order' in $$props) $$invalidate(1, order = $$props.order);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [items, order, onCheckout, onClearCart];
    }

    class Cart extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { items: 0, onClearCart: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Cart",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get items() {
    		throw new Error("<Cart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<Cart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onClearCart() {
    		throw new Error("<Cart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onClearCart(value) {
    		throw new Error("<Cart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.44.1 */
    const file = "src/App.svelte";

    // (40:4) {:catch error}
    function create_catch_block(ctx) {
    	let p;
    	let t_value = /*error*/ ctx[5].message + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			set_style(p, "color", "red");
    			add_location(p, file, 40, 6, 979);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(40:4) {:catch error}",
    		ctx
    	});

    	return block;
    }

    // (33:4) {:then catelog}
    function create_then_block(ctx) {
    	let div1;
    	let div0;
    	let cateloglist;
    	let t;
    	let cart;
    	let current;

    	cateloglist = new CatelogList({
    			props: {
    				onItemClicked: /*onItemClicked*/ ctx[2],
    				items: /*catelog*/ ctx[4].objects
    			},
    			$$inline: true
    		});

    	cart = new Cart({
    			props: {
    				items: /*selectedItems*/ ctx[0],
    				onClearCart: /*onClearCart*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			create_component(cateloglist.$$.fragment);
    			t = space();
    			create_component(cart.$$.fragment);
    			attr_dev(div0, "class", "list-container");
    			add_location(div0, file, 34, 8, 778);
    			attr_dev(div1, "class", "content");
    			add_location(div1, file, 33, 6, 748);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			mount_component(cateloglist, div0, null);
    			append_dev(div1, t);
    			mount_component(cart, div1, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const cart_changes = {};
    			if (dirty & /*selectedItems*/ 1) cart_changes.items = /*selectedItems*/ ctx[0];
    			cart.$set(cart_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cateloglist.$$.fragment, local);
    			transition_in(cart.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cateloglist.$$.fragment, local);
    			transition_out(cart.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(cateloglist);
    			destroy_component(cart);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(33:4) {:then catelog}",
    		ctx
    	});

    	return block;
    }

    // (31:20)        <p>Loading...</p>     {:then catelog}
    function create_pending_block(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Loading...";
    			add_location(p, file, 31, 6, 704);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(31:20)        <p>Loading...</p>     {:then catelog}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div1;
    	let header;
    	let img;
    	let img_src_value;
    	let t;
    	let div0;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: true,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 4,
    		error: 5,
    		blocks: [,,,]
    	};

    	handle_promise(/*request*/ ctx[1], info);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			header = element("header");
    			img = element("img");
    			t = space();
    			div0 = element("div");
    			info.block.c();
    			if (!src_url_equal(img.src, img_src_value = "https://svelte.dev/svelte-logo-horizontal.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "App-logo");
    			attr_dev(img, "alt", "logo");
    			add_location(img, file, 23, 4, 534);
    			attr_dev(header, "class", "App-header");
    			add_location(header, file, 22, 2, 502);
    			attr_dev(div0, "class", "main");
    			add_location(div0, file, 29, 2, 658);
    			attr_dev(div1, "class", "App");
    			add_location(div1, file, 21, 0, 482);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, header);
    			append_dev(header, img);
    			append_dev(div1, t);
    			append_dev(div1, div0);
    			info.block.m(div0, info.anchor = null);
    			info.mount = () => div0;
    			info.anchor = null;
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			update_await_block_branch(info, ctx, dirty);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			info.block.d();
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const request = getCatelog();
    	let selectedItems = [];

    	const onItemClicked = selectedItem => {
    		if (selectedItem && !selectedItems.find(item => item.id === selectedItem.id)) {
    			$$invalidate(0, selectedItems = [...selectedItems, selectedItem]);
    		}
    	};

    	const onClearCart = () => {
    		$$invalidate(0, selectedItems = []);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		getCatelog,
    		CatelogList,
    		Cart,
    		request,
    		selectedItems,
    		onItemClicked,
    		onClearCart
    	});

    	$$self.$inject_state = $$props => {
    		if ('selectedItems' in $$props) $$invalidate(0, selectedItems = $$props.selectedItems);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [selectedItems, request, onItemClicked, onClearCart];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
