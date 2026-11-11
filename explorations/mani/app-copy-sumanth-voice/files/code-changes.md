# App copy: code changes

The copy files in this folder (`en.json`, `login-en.json`, `menu-en.json`) are today's `new_dev_migration` files with only the reviewed lines changed. The items below also need a code change.

## Labels that need a new key or a logic change

| Screen | Today | Should read | Change | Where |
|---|---|---|---|---|
| c05-template | 1 slides | 1 slide | Key: slide_one ("slide"), picked when n is 1. Card count uses the plural word for every count, so one-slide templates read '1 slides'. | src/listing/core/screens/templateflow/usetemplate/TemplateGalleryStep.jsx:132 (`${n} ${t("hire_slides")}`; hire_slides also used by HireAnExpertV5 and TemplateDetailsModal) |
| z011 | Export to PowerPoint | Export | Key: export. Tab holds PowerPoint, Google Slides, PDF and Image, but names only PowerPoint. | src/listing/core/screens/views/share/ShareScreen.jsx:18 (key also used by AiCreditsScreen and BillingSettings, where PowerPoint is right) |
| z034 | Let AI decide | Auto | Key: cpo_auto. Default slide count says 'Let AI decide' while Language, Level of detail and Effort on the same panel call the same default 'Auto'. | src/chat/constants.js:19 and src/chat/components/OnboardLandingUI.jsx:1543 (hard-coded labelKey; the other options there are hard-coded too) |
| t04-api | Your API keys are used to access the API on your own behalf. You will be the creator of presentations made with the API. Check out the API documentation for more information and how to use it. | See the API documentation for how to use it. | Key: apikeys_see_docs_lead (new, "See the"; then apidecumentation link and yourapikeysdescription2). On this no-API-plan view there are no keys on screen, only the Create decks at scale promo, so the line describes keys the person does not have. | src/listing/core/screens/views/settings/apikeys/ApiKeyScreen.jsx:274-283 sectionDesc, used by the promo branch at :328; keep the full text on the paid view at :348 |
| z009 | Update your password | Set a password | Key: setapassword (title when the account has no password; hide Current password then; otherwise the Profile row button reads changepassword "Change password"). Opened from Set a password on a row that says the password is not set, yet the title says Update and the first field asks for the current password. | src/listing/core/screens/views/settings/profile/ChangePasswordPopup.jsx:101, 111; opener and the unconditional "Not set: you sign in with Google." line at src/listing/core/screens/views/settings/profile/ProfileSettings.jsx:604-608 |
| z049 | Questions, bug reports, feedback - we're here for all of it. | Ask us about single sign-on (SAML) for your company. | Key: contactus_sso_desc (new; passed when opened from the SSO card). Opened from Talk to us on the single sign-on card, but the dialog is the general support form about bugs and feedback, with nothing about SSO. | src/listing/core/screens/views/settings/members/MemberSettings.jsx:497 handleTalkToUs dispatches EVENT_CONTACT_US with no context; src/editor/core/components/ContactUs.jsx:106 always uses contactusdescription |
| e09-upgrade | Upgrade | See plans | Key: seeplans. The editor button only opens the plan picker; the sidebar opens the same picker with See plans. | src/editor/core/view/editor/workspace/topmenu/TopMenu.jsx:1946, 1951 (key upgrade is used in 20 files) |
| p01-billing-free | 1 Editor · 400 Credits | 1 seat · 400 credits | Key: seat / seats, credits_lowercase. Counts seats with a role name the workspace does not use (Members shows Owner, Admin, Member); the paid plan card says "1 seat". | src/listing/core/screens/views/settings/billings/BillingSettings.jsx:957-960 |
| p01-billing-free | per user/month | a month | Key: pv2_a_month. The plan picker shows the same Basic and Pro prices as "a month"; no plan is sold per seat (Gold is one price however many join). | src/listing/core/screens/views/settings/billings/BillingSettings.jsx:1172 (perusermonth is also used by AiCreditsScreen and McpApiCreditsPopup; CreditPlansV2.jsx:126, 200 shows the same via pv2v_per_user_month) |
| p02-credits | Deck Slides | Generate | Key: generate (label usage rows through seriesOf, or add a feature-name label map). History names generation by the server's feature name; the chart on the same page calls it Generate. | src/listing/core/screens/views/settings/credits/CreditsSettings.jsx:109 mapHistoryRow (action: item.feature), rendered at :560 and in the filter at :400 |
| p24-buy-credits | deckslides | Generate | Key: deckslides (new key, "Generate"). The Event column prints a raw key: the server's "Deck Slides" has no language key. The Credits page calls this action Generate. | src/listing/core/screens/workspace/credits/AiCreditHistory.jsx:230 t(item.service.toLowerCase().replace(/ /g, "")) |
| p25-credit-history | deckslides | Generate | Key: deckslides (new key, "Generate"). The Event column prints a raw key: the server's "Deck Slides" has no language key. The Credits page calls this action Generate. | src/listing/core/screens/views/settings/billings/CreditHistoryPopup.jsx:98 |
| p27-credits-pro | Paid plans reset each year. | Your plan adds credits each month. Unused credits carry over. | Key: paidplansresetinfo_monthly (new; keep paidplansresetinfo for yearly plans). Shown on Pro monthly, whose credits come each month and carry over (Manage your plan: "credits a month · unused credits carry over"). | src/listing/core/screens/views/settings/credits/CreditsSettings.jsx:465 |
| p40-welcome-gold | You now have 1 license and 5,000 credits: everything you need to create faster and explore premium features. | You now have unlimited collaborators and 5,000 credits with every feature in the plan. | Key: pv2v_tm_badge ("Unlimited collaborators"; the span already lowercases) on Gold, in place of " 1 " + license. Gold is the plan with unlimited collaborators, one price however many join, so "1 seat" contradicts it. | src/common/components/payment/pricingNew/PaymentSuccessScreenNew.jsx:351 |
| p51-cancel-2 | 1 Presentations | 1 deck | Key: deckinproject / decksinproject. The row joins a count to a plural label, so one deck reads “1 Decks”. | src/listing/core/screens/views/settings/billings/CancelRenewalFlow.jsx:329 (`${docCount} ${getLang("cr_item_presentations")}`); existing keys deckinproject = “{count} deck”, decksinproject = “{count} decks” |
| p53-cancel-4 | Pro AI model | Ultra AI model | Key: pn_up_feat_ai_lbl. The offer to stay on Gold lists only Pro rows, so a Gold user sees the Pro model instead of Gold’s own Ultra model, shared knowledge base, team collaboration and projects. | src/listing/core/screens/views/settings/billings/CancelRenewalFlow.jsx:459 renders <NudgeFeaturePopup> with no features or tier, so NudgeFeaturePopup.jsx:106-108 keeps only non-Gold rows from featuresCatalog.js. On Gold, lead with the Gold rows and drop pro_ai_model. |
| p63-cancel-yearly-2 | 1 Presentations | 1 deck | Key: deckinproject / decksinproject. The row joins a count to a plural label, so one deck reads “1 Decks”. | src/listing/core/screens/views/settings/billings/CancelRenewalFlow.jsx:329 (`${docCount} ${getLang("cr_item_presentations")}`); existing keys deckinproject = “{count} deck”, decksinproject = “{count} decks” |
| p92-change-plan-basic | Want a smaller plan? Turn off renewal, then pick it when this plan ends on Nov 10, 2027. | (no line on Basic) | Shown on Basic, the smallest paid plan, where there is no smaller plan to pick. | src/common/components/payment/pricingV2/ManagePlanPaneV2.jsx:187 (endsOn skips cancelled, weekly and education plans but not Basic; add current.tierKind !== "basic"), rendered at :280. No new key needed. |
| p92-change-plan-basic | A Gold plan can only move to Enterprise. | Gold is the top plan. | Key: pv2mp_gold_top_plan. Raw server message on a Basic workspace: it talks about Gold and names Enterprise, a plan the app does not sell. | Server error passed to the alert toast while Manage your plan loads. Do not surface it on a non-Gold plan; on Gold, map it to a client key. |
| p92-change-plan-basic | 8× Pro | 8× Pro credits | Key: pv2_times_pro_credits. On the closed Gold card no credit figure sits beside it, so the badge does not say what is 8 times Pro. | src/common/components/payment/pricingV2/ManagePlanPaneV2.jsx:225 (badge on the collapsed move card); keep pv2_times_pro in PricingScreenV2.jsx:1394 and CheckoutSummaryV2.jsx:529, where it sits next to the credits figure |
| p99-cancel-2-pro-yearly | 1 Presentations | 1 deck | Key: deckinproject / decksinproject. The row joins a count to a plural label, so one deck reads “1 Decks”. | src/listing/core/screens/views/settings/billings/CancelRenewalFlow.jsx:329 (`${docCount} ${getLang("cr_item_presentations")}`); existing keys deckinproject = “{count} deck”, decksinproject = “{count} decks” |
| h01-home-empty | Free Plan | Free plan | Key: plan_lowercase. Plan card and workspace switcher build "<Plan> Plan" with a capital P (Free Plan, Gold Plan) while the rest of the app says "Free plan" and "Gold plan". | src/listing/core/screens/views/dashboard/sidepanel/SidePanel.jsx:716 and :727 (`${planName} ${getLang("plan")}`); the plan key is shared with places where "Plan" stands alone and is right, so use a lowercase key here |
| h13-templates | 1 slides | 11 slides (the template's real count; "1 slide" when it is one) | Key: slide_lowercase. Every card reads "1 slides": wrong plural, and the count is wrong too (the same templates open as 11 and 4 slides in z014 and z016). | src/listing/core/screens/templateflow/usetemplate/TemplateGalleryStep.jsx:131-132 (`${n} ${t("hire_slides")}` with n = tpl.slides.length, which looks like the cover only); hire_slides is shared with Hire an expert |
| h13-templates | Hr/Training | HR and training | Key: hrtraining. Category chip shows the raw server name: odd casing and a slash, unlike the other chips. | src/listing/core/screens/templateflow/usetemplate/TemplateGalleryStep.jsx:16 (catTabLabel looks up the normalised key, so adding the key is enough) |
| h14-brandkit | Neon Noir brand | Neon Noir | The "brand" suffix is added to generic catalog kits (Boardroom Gold, Meridian, Neon Noir), which are looks, not anyone's brand; it fits only the workspace's own kit (Presentations.AI brand). | src/listing/core/screens/views/dashboard/brandkit/BrandKitList.jsx:324 (LookCard: drop the suffix there, keep it on KitCard at :247) |
| h22-account | Notifications | Notification settings | Key: notificationsettings. Account menu item opens notification settings, while the bell beside it opens a panel also titled Notifications. | src/listing/core/screens/views/dashboard/topmenu/TopMenu.jsx:375 (key shared with NotificationsMenu panel title, Settings nav and NotificationSettings, where Notifications is right) |
| z014 | Use this template | View template | Key: viewtemplate. The template card's hover button says Use this template but only opens this details dialog, which has its own Use this template button. | src/listing/core/screens/views/dashboard/components/DocumentCardView.jsx:371 (onClick → Templates.jsx:218 handleTemplateClick opens TemplateDetailsModal); key shared with TemplateDetailsModal, where it is right |
| z028 | delivered to Email to 6 board members | delivered to 6 board members by email | Key: deliveredto. The label and the delivery target are joined, so the meta line reads "delivered to Email to". | src/listing/core/screens/views/dashboard/recurring/RecurringDecks.jsx:17 (delivery: "Email to 6 board members" → "6 board members by email"; label stays, built at :163) |
| z055 | root kits cannot be a default | This Brand Kit cannot be the default. | Key: bk2_default_not_allowed. Set as default is offered on a kit that cannot be the default, and the toast shows raw server text with the internal term "root kits". | src/listing/core/screens/views/dashboard/brandkit/BrandKitEditor.jsx:1545 (hide the Set as default row when the open kit is the ROOT, data.kind === "ROOT", the same test as saveAsCopy in BrandKitScreen.jsx:569); BrandKitScreen.jsx requestSetDefaultKit passes the server message through getApiErrorMessage |
| s05-share-invite | Export to PowerPoint | Export | Key: export. Tab holds PowerPoint, Google Slides, PDF and Image, but names only PowerPoint. | src/listing/core/screens/views/share/ShareScreen.jsx:18 (key also used by AiCreditsScreen and BillingSettings, where PowerPoint is right; formats in ExportScreen.jsx export_powerpoint / export_googleslides / export_pdf / export_image) |

## Text written in the code (not in the copy files)

| Where | Today | Should read |
|---|---|---|
| Sidebar, every page | Free Plan · 1 member | Free plan · 1 member |
| Plan and billing (Free) | 1 Editor · 400 Credits | 1 editor · 400 credits |
| Plan and billing (paid) | ₹1,200/month · 1 seat · 1,200 Credits | ₹1,200 a month · 1 seat · 1,200 credits |
| Plan and billing (Gold yearly) | ₹116,125/year · 1 seat · 66,200 Credits | ₹116,125 a year · 1 seat · 66,200 credits |
| Welcome to Pro / Gold | Welcome to Pro Plan | Welcome to Pro |
| Welcome to Pro / Gold | We've sent you a confirmation email and invoice at {email} | We sent the confirmation and invoice to {email}. |
| Welcome to Pro / Gold | You now have 1 license and 800 credits: everything you need to create faster and explore premium features. | You now have 1 seat and 800 credits. |
| Buy credits | 2000 Credits | 2,000 credits |
| Cancel renewal, step 2 | Nothing changes today, you're on Gold until {date} | Nothing changes today. You're on Gold until {date}. |
| Cancel renewal, step 2 | 1 Presentations | 1 deck |
| Cancel renewal, step 2 | 6,100 Unused Credits | 6,100 unused credits |
| Cancel renewal, step 2 | Cancelling only stops next year's renewal. (shown on monthly plans too) | Cancelling only stops the next renewal. |
| Cancel renewal, step 4 | Loyalty discount(20%) | Loyalty offer · 20% off |
| Hire an expert | Craft Engaging Presentation that Capture your Audience | An expert designs your deck |
| Hire an expert | 24-hour delivery.Work starts immediately. | 24-hour delivery. Work starts right away. |
| Hire an expert | Express 24-hour delivery: perfect for urgent presentations when you need a quick turnaround. | Express: 24-hour delivery, for decks you need fast. |
| Hire an expert | Standard 72-hour delivery: our most popular option, allowing extra time for detailed design work. | Standard: 72-hour delivery, with more time for detailed design. |
| Settings: Profile | Used to sign in and for receipts. Connects your CRM and joins your company workspace | Used to sign in and for receipts. Connects your CRM and joins your company workspace. |
| Hire an expert (team view) | Professional and high-stakes oriented | For board, investor and client decks |
| Hire an expert (team view) | Outcome-focused rather than just design-focused | Works on the story as well as the design |
| Plan and billing (Gold monthly) | ₹12,000/month · 1 seat · 6,200 Credits | ₹12,000 a month · 1 seat · 6,200 credits |
| Plan and billing (Basic yearly) | ₹4,500/year · 1 seat · 4,000 Credits | ₹4,500 a year · 1 seat · 4,000 credits |
| Plan and billing (Pro yearly) | ₹11,400/year · 1 seat · 8,000 Credits | ₹11,400 a year · 1 seat · 8,000 credits |

## Bugs seen on the screens

| Where | What | Fix |
|---|---|---|
| Checkout, Pro monthly | "Before you go: 0% off your first year, for the next hour." shows on monthly checkout. The close offer is 0% there. | Hide the line when the offer is 0%. |
| Cancel renewal, step 2 (monthly plans) | "Cancelling only stops next year's renewal" on a monthly plan. | "Cancelling only stops the next renewal." |
| Manage your plan, Basic yearly | "For a smaller plan, turn off renewal, then pick it when this plan ends" shows on Basic, which is already the smallest paid plan. | Hide the line on Basic, or point to Free. |
| Cancel renewal, step 4 | "Continue to cancel" on the 20% offer cancels at once, with no confirm step. | Add a final confirm, or label the button "Cancel renewal". |
| Manage your plan, Monthly/Yearly switch | Confirm pays for the default option if the Yearly switch hasn't finished loading; the summary panel updates late. | Disable Confirm until the selected plan and amount are loaded. |
| Chart settings | Key startangle shows "End Angle" and endangle shows "Start Angle". | Swap the two labels. |
| Copyright line | Shows "¬©" instead of "©" (encoding). | Save the string as UTF-8. |
| Split content option | Key splitcontent shows "XML". | Check the intended label. |
| Cancel renewal step 2 (p51, p63, p99) | "1 Decks": the count and noun come from code, so one deck still reads plural. | Pick "deck" or "decks" from the count in CancelRenewalFlow. |
| Template cards (c05, h13) | "1 slides" on every one-slide template card. | Use the singular when the count is 1. |
| Hire an expert upload (z020, z021) | "designed in 72 hour." and "24 hour.": the hour unit is not pluralised. | Write "hours" for any count but 1. |
| Plan and billing, change plan, consent lines (p21, p22, p45, p46, p60, p89, p91, p96, p97) | Prices and dates are built in code: "₹1,200/month", "1,200 Credits", "100 Credits used", "Total", and US dates ("December 10, 2026", "Dec 10, 2026", "Nov 10 2026"). | Format money as "₹1,200 a month", counts in sentence case, dates as "10 December 2026" or "10 Dec 2026". |
| Sidebar and workspace switcher (h01, h09, p64) | "Free Plan", "Gold Plan", "Basic Plan": built from the plan subtype plus "Plan", so the reviewed copy key does not reach it. | Use the copy key, or lower-case "plan". |
| Credit history (p24, p25, p02) | Raw event key "deckslides" and "Deck Slides" shown as the event name; "+60000" without a thousands separator. | Map event keys to copy keys; format numbers with separators. |
| Buy credits (p26, p27, p65) | "2000 Credits" and "Buy 2000 credits": numbers without separators. | Format as 2,000. |
| Template categories (c05, h13) | "Hr/Training" category comes from the server. | Rename the category to "HR and training" on the server. |
| Brand Kit (z055) | Toast shows the raw server message "root kits cannot be a default". | Map the server error to a copy key, for example "This Brand Kit cannot be the default." |
| Sign-in and security (z009) | "Set a password" (Google sign-in, no password yet) opens "Update your password" and asks for a current password. | Open a Set password dialog without the current password field. |
| Schedule line (z028) | "delivered to Email to 6 board members": doubled "to", capital "Email". | Fix the sentence template in code. |
| Gold card description (p22, p30, p42, p46, p47, p92, p97) | The pricing-pass Gold line "For teams: unlimited collaborators and frontier AI models" wraps and leaves "models" alone on line 2. | Shorten the line (see Decisions) or widen the card text. |
| Plan feature table (FeatureTableScreen.jsx, line 56) | Hard-coded em dash marks a feature that is not included. It is the only em dash left in on-screen app text; the copy files now have none. | Show a minus icon, or the words "Not included" (with an aria-label), instead of the dash. |

## Decisions for Mani (not applied)

| Screen | Today | Suggested | Question |
|---|---|---|---|
| o01-role | Lite | Student price | Lite badge: a student price, or a plan name? No Lite plan exists. |
| t03-members | Enterprise |  | Enterprise badge on single sign-on: plans are Basic, Pro and Gold only. |
| p43-home-gold-cancelled | Your investor update, ready on the 1st of every month | Your next investor update | Home hero promises an investor update ready on the 1st of every month, but recurring decks are switched off (SHOW_RECURRING_DECKS = false). |
| p43-home-gold-cancelled | Built from your finance sheet. A new month brings new numbers in the same structure. | Start a new deck, or import last month’s PowerPoint and update the numbers. | Same hero, sub line. |
| p64-home-gold | Your investor update, ready on the 1st of every month | Your next investor update | Same investor update hero. |
| p64-home-gold | Built from your finance sheet. A new month brings new numbers in the same structure. | Start a new deck, or import last month’s PowerPoint and update the numbers. | Same investor update hero. |
| p66-members-gold | Enterprise | On request | Same Enterprise badge (Gold members page). |
| p93-home-basic | Your investor update, ready on the 1st of every month | Your next investor update | Same investor update hero. |
| p93-home-basic | Built from your finance sheet. A new month brings new numbers in the same structure. | Start a new deck, or import last month’s PowerPoint and update the numbers. | Same investor update hero. |
| z013 | Your investor update, ready on the 1st of every month | Your next investor update | Same investor update hero. |
| z013 | Built from your finance sheet. A new month brings new numbers in the same structure. | Start a new deck, or import last month’s PowerPoint and update the numbers. | Same investor update hero. |
| h07-search | Search decks, settings and actions | Search decks, folders and actions | Search placeholder says "settings"; reviewer says search returns decks, folders and actions only. |
| h07-search | Search decks, settings, actions | Search decks, folders and actions | Same, top bar placeholder. |
