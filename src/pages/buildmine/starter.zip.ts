import { downloadKit, sample } from '../../lib/buildmine-kit';
export function GET() { return new Response(downloadKit(sample), {headers:{'Content-Type':'application/zip','Content-Disposition':'attachment; filename=buildmine-starter-1.0.0.zip'}}); }
