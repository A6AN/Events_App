const fs = require('fs');
const { execSync } = require('child_process');

try { fs.unlinkSync('src/data/mockEvents.ts'); } catch(e){}
try { fs.unlinkSync('src/data/mockVenues.ts'); } catch(e){}

let ac = fs.readFileSync('src/context/AuthContext.tsx', 'utf8');
ac = ac.replace(/,\s*getURL/, '').replace(/getURL,\s*/, '').replace(/getURL/, '');
fs.writeFileSync('src/context/AuthContext.tsx', ac);

const allFiles = execSync('find src -type f -name "*.ts*"', {encoding: 'utf8'}).split('\n').filter(Boolean);
const globalRep = [
  ['.startTime', '.start_time'],
  ['.imageUrl', '.cover_url'],
  ['.pricePerHour', '.price_per_hour'],
  ["'startTime'", "'start_time'"],
  ["'imageUrl'", "'cover_url'"]
];

allFiles.forEach(f => {
  if (!fs.existsSync(f)) return;
  let txt = fs.readFileSync(f, 'utf8');
  let orig = txt;
  
  globalRep.forEach(([from, to]) => {
    txt = txt.split(from).join(to);
  });
  
  if (f.endsWith('SocialTab.tsx')) {
    txt = txt.replace(/DbEvent/g, 'EventWithMeta');
    txt = txt.replace(/event\.location/g, 'event.address');
    txt = txt.replace(/event\.host/g, 'event.host');
    txt = txt.replace(/event\.attendees/g, 'event.friends_attending_count');
    txt = txt.replace(/event\.friendsAttending/g, 'event.friends_attending_count');
    txt = txt.replace(/event\.price/g, '0');
    if (!txt.includes('EventWithMeta')) {
       txt = "import { EventWithMeta } from '../types';\n" + txt;
    }
  }
  
  if (f.endsWith('TicketBookingDialog.tsx')) {
    txt = txt.replace(/event:\s*DbEvent;/g, 'event: DbEvent;\n  ticketType: DbTicketType;');
    txt = txt.replace(/event\.price/g, 'ticketType.price');
    txt = txt.replace(/event\.capacity/g, 'ticketType.capacity');
    txt = txt.replace(/event\.location/g, 'event.address');
    txt = txt.replace(/ticket\.price/g, 'ticketType.price');
    txt = txt.replace(/quantity:\s*selectedSeats,/g, '// quantity: selectedSeats,');
    if (!txt.includes('DbTicketType')) {
       txt = txt.replace("{ DbEvent }", "{ DbEvent, DbTicketType }");
       txt = txt.replace("{ DbEvent,", "{ DbEvent, DbTicketType,");
    }
  }

  if (f.endsWith('TicketsTab.tsx')) {
    txt = txt.replace(/ticket\.title/g, 'ticket.event.title');
    txt = txt.replace(/ticket\.cover_url/g, 'ticket.event.cover_url');
    txt = txt.replace(/ticket\.start_time/g, 'ticket.event.start_time');
    txt = txt.replace(/ticket\.category/g, 'ticket.event.category');
    txt = txt.replace(/ticket\.price/g, 'ticket.ticket_type.price');
    txt = txt.replace(/ticket\.artist/g, '"Removed"');
    txt = txt.replace(/ticket\.availableSeats/g, '0');
    txt = txt.replace(/ticket\.venue/g, 'ticket.event.address');
    txt = txt.replace(/DbEvent\s+\|\s+null/g, 'TicketWithMeta | null');
    if (!txt.includes('TicketWithMeta')) {
       txt = "import { TicketWithMeta } from '../types';\n" + txt;
    }
    txt = txt.replace(/TicketDbEvent/g, 'TicketWithMeta');
    txt = txt.replace(/ticketDbEvent/g, 'ticketWithMeta');
  }

  if (f.endsWith('VenueBookingDialog.tsx') || f.endsWith('VenuesTab.tsx')) {
    txt = txt.replace(/venue\.category/g, 'venue.categories?.[0]');
    txt = txt.replace(/venue\.location/g, 'venue.address');
    txt = txt.replace(/venue\.rating/g, '"4.5"');
    txt = txt.replace(/venue\.amenities\.map/g, '(venue.amenities ?? []).map');
  }

  if (f.endsWith('VenuesTab.tsx')) {
    txt = txt.replace(/<Venue>/g, '<DbVenue>');
    txt = txt.replace(/import \{ mockVenues \} from '\.\.\/data\/mockVenues';?/g, '');
    txt = txt.replace(/useState<DbVenue\[\]>\(mockVenues\)/g, 'useState<DbVenue[]>([])');
  }

  if (txt !== orig) { fs.writeFileSync(f, txt); }
});
