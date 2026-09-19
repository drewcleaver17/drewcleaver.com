import css from '../../../../../starter/styles.css?raw';
export function GET() {return new Response(css,{headers:{'Content-Type':'text/css; charset=utf-8'}});}
