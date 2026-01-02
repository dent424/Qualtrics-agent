# Deep Research: Qualtrics DOM Structure Analysis

Comprehensive comparison of our documentation vs. actual Qualtrics implementation.

## ✅ What We Have CORRECT

### Core Selectors
- ✅ `.QuestionOuter` - Question container
- ✅ `.QuestionText` - Question text/title
- ✅ `.QuestionBody` - Answer options container
- ✅ `#NextButton` - Navigation button (no separate #SubmitButton)
- ✅ `#PreviousButton` - Back button
- ✅ DOM replication during transitions (CRITICAL warning documented)
- ✅ Two survey engines (JFE vs Legacy) with timing differences
- ✅ `waitForLoadState('networkidle')` after navigation

### Question Types Covered
- ✅ Radio buttons (`input[type="radio"]`)
- ✅ Checkboxes (`input[type="checkbox"]`)
- ✅ Matrix tables (both `table.Matrix` AND `table.ChoiceStructure`)
- ✅ Sliders (both `input[type="range"]` AND `.ResultsInput`)
- ✅ Text entry (both `.InputText` AND `.TextEntryBox`)
- ✅ Textarea for long text

## ⚠️ CRITICAL GAPS FOUND

### 1. **New Survey Experience (NSE/Simple Layout) - MAJOR ISSUE**

Our documentation assumes Classic Layout only. NSE has **completely different selectors**!

**Key Differences:**

| Element | Classic Layout | NSE/Simple Layout |
|---------|---------------|-------------------|
| Question ID | `#QID1` | `#question-QID1` |
| Next Button | `#NextButton` | `#next-button` |
| Previous Button | `#PreviousButton` | `#previous-button` |
| Text Input Class | `.InputText` | `.text-input` |
| Dropdowns | `<select>` element | Not `<select>` (custom component) |
| jQuery | Included by default | Must load manually |
| Technology | Traditional DOM | ReactJS |

**Sources:**
- [Moving Next Button - NSE](https://community.qualtrics.com/custom-code-12/moving-next-button-to-the-top-of-survey-new-survey-experience-31733)
- [Simple Layout No jQuery](https://community.qualtrics.com/custom-code-12/simple-layout-no-jquery-24301)
- [Simple Layout Update CSS](https://community.qualtrics.com/custom-code-12/simple-layout-update-css-w-js-27499)

**Impact:** Our current selectors will FAIL on NSE surveys!

**Detection Strategy:**
```typescript
async function detectLayout(page: Page): Promise<'classic' | 'nse'> {
  // NSE uses #next-button, Classic uses #NextButton
  const nseButton = await page.locator('#next-button').count();
  const classicButton = await page.locator('#NextButton').count();

  if (nseButton > 0) return 'nse';
  if (classicButton > 0) return 'classic';

  // Fallback: check question ID format
  const nseQuestion = await page.locator('[id^="question-QID"]').count();
  return nseQuestion > 0 ? 'nse' : 'classic';
}
```

### 2. **Missing Question Types**

**Dropdown/Select Questions**
- Classic: Uses `<select>` element
- NSE: Does NOT use `<select>` - uses custom component
- No documentation for automation

**Rank Order (Drag & Drop)**
- Uses drag-and-drop interface
- Difficult to automate with standard Playwright
- May require `page.dragAndDrop()` API

**Constant Sum**
- Uses `.SumInput` class for input fields
- Has `.SumTotal` for the total field
- Three variations: choices, bars, sliders
- Sources:
  - [Constant Sum Question](https://www.qualtrics.com/support/survey-platform/survey-module/editing-questions/question-types-guide/specialty-questions/constant-sum/)
  - [Formatting Constant Sum](https://community.qualtrics.com/custom-code-12/formatting-the-constant-sum-question-26454)

**Side-by-Side Questions**
- QuestionType: "SBS", Selector: "SBSMatrix"
- Element IDs like "QR~QID29#2~3~1~TEXT"
- Complex table structure
- Sources:
  - [Side by Side Question](https://www.qualtrics.com/support/survey-platform/survey-module/editing-questions/question-types-guide/standard-content/side-by-side/)
  - [SBS Question Custom Validation](https://community.qualtrics.com/survey-platform-54/side-by-side-question-custom-validation-23244)

### 3. **Question ID Targeting**

Our docs don't mention the `#QID` pattern for targeting specific questions.

**Pattern:**
```typescript
// Target specific question by ID
const questionContainer = page.locator('#QID1');
const questionText = page.locator('#QID1 .QuestionText');
const questionBody = page.locator('#QID1 .QuestionBody');

// NSE equivalent
const nseQuestion = page.locator('#question-QID1');
```

**Source:** [CSS Classes for Questions](https://community.qualtrics.com/custom-code-12/css-classes-for-questions-apply-css-style-to-some-questions-only-2587)

### 4. **.Skin Prefix**

Many Qualtrics CSS classes are prefixed with `.Skin`:
- `.Skin .QuestionOuter`
- `.Skin .QuestionText`
- `.Skin .QuestionBody`

Our selectors work without it (more general), but documentation should mention it.

**Source:** [CSS Terms for Question Areas](https://community.qualtrics.com/survey-platform-54/css-terms-for-question-areas-14200)

### 5. **Click Event Behavior in NSE**

**IMPORTANT:** In NSE, click events target the label, not the radio/checkbox!

```typescript
// Classic: click fires on input element
input[type="radio"]:checked

// NSE: click fires on label or span
label > span (clicked element)
```

This affects `questionclick` event handlers.

**Source:** [Simple Layout JavaScript](https://community.qualtrics.com/custom-code-12/simple-layout-javascript-to-autoadvance-on-a-single-question-nps-26666)

## 📊 Coverage Analysis

### Question Types Coverage

| Question Type | Documented? | Tested? | Notes |
|--------------|-------------|---------|-------|
| Single Choice (Radio) | ✅ Yes | ❌ No | Classic selectors only |
| Multiple Choice (Checkbox) | ✅ Yes | ❌ No | Classic selectors only |
| Matrix/Likert | ✅ Yes | ❌ No | Both classes covered |
| Slider | ✅ Yes | ❌ No | Both selectors covered |
| Text Entry (Short) | ✅ Yes | ❌ No | Both classes covered |
| Text Entry (Long) | ✅ Yes | ❌ No | Textarea covered |
| Dropdown/Select | ❌ No | ❌ No | MISSING |
| Rank Order | ❌ No | ❌ No | MISSING |
| Constant Sum | ❌ No | ❌ No | MISSING |
| Side-by-Side | ❌ No | ❌ No | MISSING |

### Layout Coverage

| Layout | Coverage | Notes |
|--------|----------|-------|
| Classic (Flat theme) | ✅ 80% | Core selectors documented |
| NSE/Simple Layout | ❌ 0% | COMPLETELY MISSING |
| Legacy SurveyEngine | ⚠️ Partial | Timing mentioned, selectors same as Classic |
| JFE (JavaScript Form Engine) | ⚠️ Partial | Timing mentioned, selectors same as Classic |

## 🔧 Recommended Updates

### Priority 1: CRITICAL (Breaks automation)

1. **Add NSE Detection & Dual Selectors**
   - Document `#next-button` vs `#NextButton`
   - Document `#question-QID` vs `#QID`
   - Document `.text-input` vs `.InputText`
   - Add layout detection function

2. **Add Dropdown Question Type**
   - Document `<select>` for Classic
   - Document custom component for NSE
   - Add automation examples

### Priority 2: HIGH (Common question types)

3. **Add Rank Order Question Type**
   - Document drag-and-drop automation
   - Note difficulty for Playwright
   - Suggest alternative (keyboard navigation?)

4. **Add Constant Sum Question Type**
   - Document `.SumInput` selector
   - Document three variations
   - Add automation examples

5. **Add Side-by-Side Question Type**
   - Document SBSMatrix structure
   - Document element ID patterns
   - Add automation examples

### Priority 3: MEDIUM (Documentation completeness)

6. **Add Question ID Targeting Section**
   - Document `#QID` pattern
   - Show how to target specific questions
   - Note NSE uses `#question-QID`

7. **Add .Skin Prefix Note**
   - Document that `.Skin` prefix exists
   - Explain it's optional (broader selectors work)
   - Show examples with and without

8. **Add NSE Click Behavior Warning**
   - Document that clicks target labels in NSE
   - Note this affects event handlers
   - Show workarounds if needed

## 🎯 Action Plan

### Immediate (Today)

1. ✅ Complete deep research (DONE)
2. ⏳ Add NSE/Simple Layout section to qualtrics-selectors.md
3. ⏳ Add layout detection function
4. ⏳ Update all selectors to include NSE alternatives

### Short-term (This Week)

5. Add missing question types:
   - Dropdown
   - Rank Order
   - Constant Sum
   - Side-by-Side

6. Add question ID targeting examples

7. Test with actual Qualtrics surveys (both layouts)

### Long-term (Future)

8. Create separate NSE guide if complexity warrants
9. Add screenshots/examples for each question type
10. Build test suite for different layouts

## 📚 Additional Sources

**NSE/Simple Layout:**
- [New Survey Taking Experience](https://www.qualtrics.com/support/survey-platform/survey-module/look-feel/simple-layout/)
- [OSU NSE Guide](https://u.osu.edu/qualtrics/2025/04/02/qualtrics-new-survey-taking-experience/)
- [Colgate NSE Guide](https://www.colgate.edu/about/offices-centers-institutes/information-technology-services/its-updates/qualtrics-new-survey)

**Question Types:**
- [Qualtrics Question Types PDF](https://www.siue.edu/its/qualtrics/pdf/basic_survey/QualtricsQuestionTypes.pdf)
- [Accessibility Recommendations](https://www.colorado.edu/digital-accessibility/resources/qualtrics-accessibility-recommendations-enabled-question-types)

**DOM Structure:**
- [JavaScript & Qualtrics Getting Started](https://medium.com/@mc_bloomfield/javascript-and-qualtrics-getting-started-34f113cbeaaa)
- [JavaScript & Qualtrics Best Practices](https://medium.com/@mc_bloomfield/javascript-qualtrics-c4bf4fb93fff)

## 🚨 Risk Assessment

**Current Setup:**
- ✅ Works for Classic Layout surveys
- ❌ FAILS for NSE/Simple Layout surveys
- ⚠️ Missing 40% of question types

**Mitigation:**
1. Add NSE detection immediately
2. Test with BOTH layouts
3. Document limitations clearly
4. Add graceful degradation for unsupported types

## 💡 Key Insights

1. **Qualtrics has TWO completely different front-ends** - our docs only cover one!
2. **NSE is becoming the default** - some organizations are migrating to it
3. **Selector patterns are predictable** - we can build robust fallback strategies
4. **Community docs are extensive** - lots of real-world examples available

## ✅ Bottom Line

**What we have is GOOD for Classic Layout**, but we're missing:
- ❌ NSE/Simple Layout support (CRITICAL)
- ❌ 4 common question types
- ⚠️ Some edge cases

**Recommendation:** Update qualtrics-selectors.md to add NSE support immediately, then add missing question types.
