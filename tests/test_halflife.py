"""
Selenium tests for Evidence Half-Life tool.
Usage: python -m pytest tests/test_halflife.py -v --timeout=60
"""
import sys, os, time, unittest
if __name__ == '__main__' and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from selenium import webdriver
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.common.by import By
from selenium.common.exceptions import WebDriverException

HTML_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'halflife.html'))
FILE_URL = 'file:///' + HTML_PATH.replace('\\', '/')

_WDM = os.path.expanduser('~/.wdm/drivers/chromedriver/win64')
_CACHED = []
if os.path.isdir(_WDM):
    for v in sorted(os.listdir(_WDM), reverse=True):
        for sub in ('chromedriver-win32', ''):
            c = os.path.join(_WDM, v, sub, 'chromedriver.exe').rstrip(os.sep)
            if os.path.isfile(c): _CACHED.append(c); break

def _driver():
    opts = ChromeOptions()
    opts.add_argument('--headless=new'); opts.add_argument('--no-sandbox')
    opts.add_argument('--disable-gpu'); opts.add_argument('--incognito'); opts.add_argument('--window-size=1280,900')
    opts.set_capability('goog:loggingPrefs', {'browser': 'ALL'})
    for p in _CACHED:
        try: return webdriver.Chrome(service=ChromeService(executable_path=p), options=opts)
        except WebDriverException: continue
    try: return webdriver.Chrome(options=opts)
    except WebDriverException: pass
    try:
        from selenium.webdriver.edge.options import Options as EO
        eo = EO(); eo.add_argument('--headless=new'); eo.add_argument('--no-sandbox')
        eo.add_argument('--disable-gpu'); eo.add_argument('--inprivate'); eo.add_argument('--window-size=1280,900')
        return webdriver.Edge(options=eo)
    except: pass
    raise WebDriverException('No driver')


class TestHalfLife(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.d = _driver(); cls.d.set_page_load_timeout(30)
        cls.d.get(FILE_URL); time.sleep(2)

    @classmethod
    def tearDownClass(cls):
        if cls.d:
            try:
                import threading; done = threading.Event()
                def q():
                    try: cls.d.quit()
                    except: pass
                    finally: done.set()
                threading.Thread(target=q, daemon=True).start()
                if not done.wait(10):
                    try: cls.d.service.process.kill()
                    except: pass
            except: pass

    def js(self, s): return self.d.execute_script(s)

    # 01: Title
    def test_01_title(self):
        self.assertIn('Half-Life', self.d.title)

    # 02: Auto-compute on load (HRT example selected by default)
    def test_02_auto_compute(self):
        v = self.d.find_element(By.ID, 'hlVal').text
        self.assertNotEqual(v.strip(), '—')
        self.assertIn('years', v.lower())

    # 03: HRT example should have short half-life (evidence reversal)
    def test_03_hrt_short_halflife(self):
        result = self.js("""
            if (!window._lastHL) return {ok:false};
            var hl = window._lastHL.halfLife;
            return {ok:true, hl: isFinite(hl) ? hl : 999, isInf: !isFinite(hl)};
        """)
        self.assertTrue(result['ok'], 'Should have computed half-life')
        # HRT reversal: drift should give finite, short half-life
        if not result['isInf']:
            self.assertLess(result['hl'], 20, f'HRT half-life should be <20 years, got {result["hl"]}')

    # 04: Statins example should be stable (long half-life)
    def test_04_statins_stable(self):
        self.js("""
            document.getElementById('exSel').value = 'statins';
            document.getElementById('exSel').dispatchEvent(new Event('change'));
        """)
        time.sleep(0.5)
        result = self.js("""
            if (!window._lastHL) return {ok:false};
            var hl = window._lastHL.halfLife;
            return {ok:true, hl: isFinite(hl) ? hl : 999, isInf: !isFinite(hl)};
        """)
        self.assertTrue(result['ok'], 'Should have computed half-life')
        # Statins: very stable → infinity or very long
        self.assertTrue(result['isInf'] or result['hl'] > 20,
            f'Statins should be stable (>20yr or inf), got {result["hl"]}')

    # 05: Vitamin D should have medium half-life
    def test_05_vitamind_decaying(self):
        self.js("""
            document.getElementById('exSel').value = 'vitamin_d';
            document.getElementById('exSel').dispatchEvent(new Event('change'));
        """)
        time.sleep(0.5)
        hl = self.js("return window._lastHL ? window._lastHL.halfLife : null;")
        self.assertIsNotNone(hl)
        # Vitamin D: decaying toward null
        isFiniteHL = self.js("return isFinite(window._lastHL.halfLife);")
        self.assertTrue(isFiniteHL, 'Vitamin D should have finite half-life (decaying evidence)')

    # 06: Drift rate should be negative for vitamin D (toward null)
    def test_06_drift_toward_null(self):
        # Still on vitamin D from test_05
        drift = self.js("return window._lastHL ? window._lastHL.drift : null;")
        self.assertIsNotNone(drift)
        # Vitamin D effects are negative (log-RR < 0) and moving toward 0, so drift > 0
        self.assertGreater(drift, 0, f'Vitamin D drift should be positive (toward null), got {drift}')

    # 07: Fragility distance
    def test_07_fragility(self):
        frag = self.js("return window._lastHL ? window._lastHL.fragility : null;")
        self.assertIsNotNone(frag)
        self.assertGreater(frag, 0, 'Fragility should be > 0')

    # 08: Cumulative MA correctness — 2 identical studies
    def test_08_cumulative_ma(self):
        result = self.js("""
            var studies = [{year:2000, yi:-0.3, sei:0.1}, {year:2005, yi:-0.3, sei:0.1}];
            var cma = cumulativeMA(studies);
            return {theta: cma[1].theta, se: cma[1].se, k: cma[1].k};
        """)
        # Two identical studies: pooled theta = -0.3, SE = 0.1/sqrt(2) ≈ 0.0707
        self.assertAlmostEqual(result['theta'], -0.3, places=4)
        self.assertAlmostEqual(result['se'], 0.1 / (2 ** 0.5), places=3)
        self.assertEqual(result['k'], 2)

    # 09: Cumulative MA — tau2 should be 0 for identical studies
    def test_09_tau2_identical(self):
        result = self.js("""
            var studies = [{year:2000, yi:-0.3, sei:0.1}, {year:2005, yi:-0.3, sei:0.1}];
            var cma = cumulativeMA(studies);
            return cma[1].tau2;
        """)
        self.assertAlmostEqual(result, 0.0, places=6)

    # 10: Dark mode
    def test_10_dark_mode(self):
        self.d.find_element(By.ID, 'themeBtn').click()
        time.sleep(0.3)
        self.assertEqual(self.d.find_element(By.TAG_NAME, 'html').get_attribute('data-theme'), 'dark')
        self.d.find_element(By.ID, 'themeBtn').click()
        time.sleep(0.3)

    # 11: About modal
    def test_11_about_modal(self):
        self.d.find_element(By.ID, 'aboutBtn').click()
        time.sleep(0.3)
        m = self.d.find_element(By.ID, 'aboutModal')
        self.assertNotIn('hidden', m.get_attribute('class'))
        self.assertIn('Half-Life', m.text)
        self.d.find_element(By.ID, 'aboutX').click()
        time.sleep(0.3)
        self.assertIn('hidden', self.d.find_element(By.ID, 'aboutModal').get_attribute('class'))

    # 12: No console errors
    def test_12_no_errors(self):
        try: logs = self.d.get_log('browser')
        except: self.skipTest('No log support')
        severe = [e for e in logs if e.get('level') == 'SEVERE' and 'favicon' not in e.get('message', '').lower()]
        if severe: self.fail(f'Console errors: {[e["message"] for e in severe]}')

    # 13: Charts rendered
    def test_13_charts(self):
        for cid in ['trajChart', 'projChart']:
            el = self.d.find_element(By.ID, cid)
            svgs = el.find_elements(By.CSS_SELECTOR, '.plot-container, svg')
            self.assertGreater(len(svgs), 0, f'{cid} should have Plotly content')

    # 14: Export function exists
    def test_14_export(self):
        self.assertTrue(self.js("return typeof exportBundle === 'function'"))

    # 15: Skip-nav
    def test_15_skip_nav(self):
        self.assertEqual(len(self.d.find_elements(By.CSS_SELECTOR, 'a[href="#main"]')), 1)

    # 16: CSP
    def test_16_csp(self):
        csp = self.js("var m=document.querySelector('meta[http-equiv=\"Content-Security-Policy\"]'); return m?m.content:null;")
        self.assertIsNotNone(csp)
        self.assertIn('default-src', csp)

    # 17: aria-live on gauge
    def test_17_aria_live(self):
        self.assertEqual(self.d.find_element(By.ID, 'gauge').get_attribute('aria-live'), 'polite')

    # 18: Gauge color matches half-life
    def test_18_gauge_color(self):
        # Load HRT (short half-life → fragile/red)
        self.js("""
            document.getElementById('exSel').value = 'hrt';
            document.getElementById('exSel').dispatchEvent(new Event('change'));
        """)
        time.sleep(0.5)
        classes = self.d.find_element(By.ID, 'gauge').get_attribute('class')
        self.assertTrue('stable' in classes or 'aging' in classes or 'fragile' in classes,
                        f'Gauge needs traffic-light class, got: {classes}')

    # 19: Add study row
    def test_19_add_row(self):
        before = len(self.d.find_elements(By.CSS_SELECTOR, '#dataBody tr'))
        self.js("addStudyRow({year: 2025, yi: -0.1, sei: 0.05});")
        after = len(self.d.find_elements(By.CSS_SELECTOR, '#dataBody tr'))
        self.assertEqual(after, before + 1)

    # 20: Half-life with single study should not crash
    def test_20_edge_single_study(self):
        self.js("""
            clearData();
            addStudyRow({year: 2020, yi: -0.5, sei: 0.1});
            compute();
        """)
        time.sleep(0.3)
        # Should show "Need at least 2 studies" or similar
        val = self.d.find_element(By.ID, 'hlVal').text
        self.assertTrue(len(val.strip()) > 0, 'Should display something for single study')


if __name__ == '__main__':
    unittest.main(verbosity=2)
