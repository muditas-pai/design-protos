import slide1 from '../assets/slide-1.png'
import slide2 from '../assets/slide-2.png'
import slide3 from '../assets/slide-3.png'
import slide4 from '../assets/slide-4.png'
import slide5 from '../assets/slide-5.png'
import collab1 from '../assets/collab-1.png'
import collab2 from '../assets/collab-2.png'
import collab3 from '../assets/collab-3.svg'

export const doc = { title: 'Monthly business review' }

export const collaborators = [
  { id: 1, name: 'Priya Nair', avatar: collab1 },
  { id: 2, name: 'Sam Okonkwo', avatar: collab2 },
  { id: 3, name: '+2 others', avatar: collab3, overflow: '+2' },
]

export const slides = [
  { n: 1, thumb: slide1, title: 'Title' },
  { n: 2, thumb: slide2, title: 'Adoption over time' },
  { n: 3, thumb: slide3, title: 'Global reach' },
  { n: 4, thumb: slide4, title: 'Company Overview' },
  { n: 5, thumb: slide5, title: 'Closing' },
]

/* Slide 4, the one open on the canvas. Content only — layout lives in the
   SlideCanvas component. */
export const slide4Content = {
  title: 'Company Overview',
  stats: [
    { label: 'Total registered users¹', value: '>254M' },
    { label: 'Creative Subscriptions Annualized Recurring Revenue¹', value: '~$1.2B' },
    { label: 'Employees¹', value: '~5,000' },
    { label: "Q2'23 GPV", value: '$2.8B' },
    { label: "Q2'23 Transaction Revenue", value: '$45M' },
    { label: "Q2'23 Partners Revenue", value: '$115M' },
    { label: '% of revenue from outside North America²', value: '~40%' },
    { label: 'Languages', value: '22' },
  ],
  footnotes: [
    '1 As of June 30, 2023',
    "2 Q2'23 Revenue by Geography based on constant FX rates from Q2'22",
  ],
  note:
    'Note: Creative Subscriptions Annualized Recurring Revenue (ARR) is calculated as ' +
    'Creative Subscriptions Monthly Recurring Revenue (MRR) multiplied by 12. Creative ' +
    'Subscriptions MRR is calculated as the total of (i) all active Creative Subscriptions ' +
    'in effect on the last day of the period, multiplied by the monthly revenue of such ' +
    'Creative Subscriptions, other than domain registrations; (ii) the average revenue per ' +
    'month from domain registrations in effect on the last day of the period; and (iii) ' +
    'monthly revenue from other partnership agreements and enterprise partners. We believe ' +
    'that ARR is a leading indicator of our anticipated Creative Subscription revenues as ' +
    'it captures both the growth we generate from the number of premium subscriptions as ' +
    'well as the amount of revenue we generate per premium subscription.',
  footer: { left: 'Company Overview', sub: 'Second Quarter 2023', page: '04', brand: 'WIX' },
}
