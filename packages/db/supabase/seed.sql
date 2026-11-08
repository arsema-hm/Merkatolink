-- MerkatoLink demo seed. FICTIONAL DATA ONLY: shops, people, phone numbers,
-- prices, rates and orders are all invented. Safe to run more than once.
--
-- Conventions used here (match them in your API and invoices):
--   * stock.qty is counted in base units (a carton of 12 = 12 base units).
--   * orders.total = subtotal + vat + delivery_fee. VAT applies to goods only,
--     and only when the trader is VAT-registered.
--   * Imported products get a retail price near their landed cost plus a margin
--     around the product's target, so Rate Shock shows a realistic mix.

-- 0. Repair rows created by the earlier version of this file ------------------
update traders set owner_name = 'Tigist (demo)' where owner_name = 'MerkatoLink (demo)';

-- 1. Terras ---------------------------------------------------------------------
insert into terras(name, name_am, description, icon) values
  ('Shema',    'ሸማ',       'Traditional cloth, textiles and everyday fabrics.',      '▧'),
  ('Kimem',    'ቅመም',      'Spices, seasonings and pantry staples.',                 '✳'),
  ('Somali',   'ሶማሌ',      'Imported vehicle and machine parts.',                    '⚙'),
  ('Termus',   'ቴርሙስ',     'Bottles, containers and household goods.',               '◉'),
  ('Minalesh', 'ምን አለሽ',   'A little of everything: mixed goods and useful finds.',  '✦')
on conflict (name) do nothing;

-- 2. Traders (the last one is unverified, to demo the verification queue) --------
insert into traders(terra_id, name, owner_name, shop_no, landmark, vat_registered, verified, tagline)
select t.id, x.name, x.owner, x.shop, x.landmark, x.vat, x.verified, x.tag
from (values
  ('Shema',    'Lomi Textiles (demo)',      'Mekdes (demo)', 'S-14',  'North gate, blue awning',       true,  true,  'Woven with care, sold by the roll.'),
  ('Shema',    'Aster Loom House (demo)',   'Hana (demo)',   'S-22',  'Near the fabric lane',          false, true,  'Cloth for every day.'),
  ('Kimem',    'Buna & Berbere (demo)',     'Dawit (demo)',  'K-08',  'Spice row, corner stall',       true,  true,  'Ground fresh, shared generously.'),
  ('Kimem',    'Mekdes Pantry (demo)',      'Tigist (demo)', 'K-17',  'Beside the grain scale',        false, true,  'Staples from familiar hands.'),
  ('Somali',   'Abay Auto Supply (demo)',   'Yonas (demo)',  'SO-31', 'East entry, second aisle',      true,  true,  'Parts that keep you moving.'),
  ('Somali',   'Blue Nile Bearings (demo)', 'Rahel (demo)',  'SO-44', 'Across the porter crossing',    false, true,  'Reliable parts, fair terms.'),
  ('Termus',   'Saba Housewares (demo)',    'Mimi (demo)',   'T-12',  'Central lane, green sign',      true,  true,  'Useful things for the home.'),
  ('Minalesh', 'Enat Mixed Goods (demo)',   'Biniam (demo)', 'M-06',  'Old stone marker, row three',   false, true,  'What might you find today?'),
  ('Minalesh', 'Fresh Start Traders (demo)','Tsion (demo)',  'M-19',  'Beside the tea stall',          false, false, 'Waiting for verification.')
) x(terra, name, owner, shop, landmark, vat, verified, tag)
join terras t on t.name = x.terra
where not exists (select 1 from traders z where z.name = x.name);

-- 3. Exchange rates: 90 days of made-up USD/ETB, rising gently ---------------------
insert into exchange_rates(rate_date, usd_etb, source)
select current_date - (89 - i),
       round((case when i < 30 then 132.5 + i * .12
                   when i < 60 then 136.1 + (i - 30) * .17
                   else 141.2 + (i - 60) * .22 end)::numeric, 2),
       'fictional demo rate'
from generate_series(0, 89) i
where not exists (select 1 from exchange_rates);

-- 4. Tax settings (demo values, verify with the Ethiopian Customs Commission) -----
insert into tax_settings(name, rate, base, sort_order, effective_from) values
  ('VAT',          .15, 'cif_duty',      30, current_date - 90),
  ('Surtax',       .10, 'running_total', 40, current_date - 90),
  ('Withholding',  .03, 'cif',           50, current_date - 90),
  ('Clearing USD',  12, 'custom',        60, current_date - 90)
on conflict (name, effective_from) do nothing;

-- 5. One shop-floor location per trader -------------------------------------------
insert into locations(trader_id, name, type)
select id, 'Shop floor', 'shop' from traders
where not exists (select 1 from locations l where l.trader_id = traders.id);

-- 6. Catalog: the same product lines are sold by every verified shop in a terra ----
drop table if exists seed_catalog;
create table seed_catalog as
select t.id as trader_id, c.name, c.category, c.base_unit, c.base_qty, c.imported,
       c.fob, c.local_price, c.margin,
       round(c.fob * 0.08 + 0.3, 2) as freight,
       round(c.fob * 0.01, 2)       as insurance,
       case c.category when 'Spare parts' then .10
                       when 'Textiles' then .20
                       when 'Bottles & containers' then .20
                       else .15 end as duty,
       0::numeric as excise,
       null::numeric as price
from (values
  -- terra, name, category, base_unit, base_qty, imported, fob_usd (per base unit), local_price, target margin %
  ('Somali',   'Brake Pad Set',          'Spare parts',          'piece',   1, true,  18,  null,  25),
  ('Somali',   'Wheel Bearing',          'Spare parts',          'piece',   1, true,  11,  null,  28),
  ('Somali',   'Oil Filter',             'Spare parts',          'piece',   1, true,  3.5, null,  30),
  ('Somali',   'Spark Plug Set',         'Spare parts',          'piece',   1, true,  6,   null,  32),
  ('Somali',   'Clutch Plate',           'Spare parts',          'piece',   1, true,  24,  null,  26),
  ('Somali',   'Engine Oil 4L',          'Spare parts',          'carton', 12, true,  9,   null,  22),
  ('Shema',    'Cotton Shema Roll',      'Textiles',             'roll',    1, true,  45,  null,  30),
  ('Shema',    'Striped Cotton Roll',    'Textiles',             'roll',    1, true,  52,  null,  28),
  ('Shema',    'Embroidered Border Roll','Textiles',             'roll',    1, false, 0,   5200,  22),
  ('Shema',    'Cotton Shawl',           'Textiles',             'piece',   1, false, 0,   650,   24),
  ('Shema',    'Cotton Blanket',         'Textiles',             'piece',   1, true,  14,  null,  26),
  ('Shema',    'Thread Spool Carton',    'Textiles',             'carton', 12, true,  1.2, null,  25),
  ('Termus',   'Vacuum Flask',           'Bottles & containers', 'carton', 12, true,  4,   null,  24),
  ('Termus',   'Glass Water Bottle',     'Bottles & containers', 'carton', 12, true,  2,   null,  25),
  ('Termus',   'Plastic Jerrycan',       'Bottles & containers', 'piece',   1, true,  2.8, null,  27),
  ('Termus',   'Glass Jar Set',          'Bottles & containers', 'carton', 12, true,  1.6, null,  25),
  ('Termus',   'Steel Lunch Box',        'Bottles & containers', 'carton', 12, true,  2.2, null,  26),
  ('Termus',   'Cooking Pot Set',        'Bottles & containers', 'piece',   1, true,  15,  null,  24),
  ('Kimem',    'Berbere Spice Sack',     'Spices',               'sack',   50, false, 0,   4600,  20),
  ('Kimem',    'Turmeric Powder Sack',   'Spices',               'sack',   50, false, 0,   3900,  20),
  ('Kimem',    'Ground Ginger Sack',     'Spices',               'sack',   50, false, 0,   4200,  20),
  ('Kimem',    'Black Cumin Sack',       'Spices',               'sack',   50, false, 0,   5100,  20),
  ('Kimem',    'Red Lentils',            'Grains & staples',     'quintal',100, false, 0,   6100,  18),
  ('Kimem',    'Chickpea Flour Sack',    'Grains & staples',     'sack',   50, false, 0,   3100,  18),
  ('Minalesh', 'Plastic Basin',          'Household',            'carton', 12, true,  1.1, null,  25),
  ('Minalesh', 'Padlock Carton',         'Household',            'carton', 12, true,  1.5, null,  27),
  ('Minalesh', 'Extension Cord',         'Household',            'piece',   1, true,  2.5, null,  28),
  ('Minalesh', 'Light Bulb Carton',      'Household',            'carton', 24, true,  0.8, null,  22),
  ('Minalesh', 'Hand Tool Set',          'Household',            'piece',   1, true,  9,   null,  26),
  ('Minalesh', 'Metal Storage Tin',      'Household',            'carton', 12, true,  1.4, null,  25)
) c(terra, name, category, base_unit, base_qty, imported, fob, local_price, margin)
join terras te on te.name = c.terra
join traders t on t.terra_id = te.id and t.verified;

-- Price imported lines from their estimated landed cost, local lines from a base price.
-- landed per base unit = (CIF + duty + excise) x 1.15 VAT x 1.10 surtax + 3% withholding.
update seed_catalog c set price =
  case when c.imported then
    round(((((c.fob + c.freight + c.insurance) * (1 + c.duty) * (1 + c.excise)) * 1.15 * 1.10
            + c.fob * 0.03) * r.rate * c.base_qty)
          / (1 - (c.margin + (abs(hashtext(c.trader_id::text || c.name)) % 11) - 4) / 100.0) / 5) * 5
  else
    round(c.local_price * (0.94 + (abs(hashtext(c.trader_id::text || c.name)) % 13) / 100.0) / 5) * 5
  end
from (select usd_etb as rate from exchange_rates order by rate_date desc limit 1) r;

insert into products(trader_id, name, category, base_unit, is_imported, target_margin)
select c.trader_id, c.name, c.category, c.base_unit, c.imported, c.margin
from seed_catalog c
where not exists (select 1 from products p where p.trader_id = c.trader_id and p.name = c.name);

insert into product_units(product_id, unit_name, base_qty, min_order_qty, retail_price)
select p.id, c.base_unit, c.base_qty,
       case when c.base_unit = 'piece' then 5 else 1 end,
       c.price
from seed_catalog c
join products p on p.trader_id = c.trader_id and p.name = c.name
where not exists (select 1 from product_units u where u.product_id = p.id);

insert into price_tiers(product_unit_id, min_qty, price)
select u.id, t.min_qty, round(u.retail_price * t.factor, 2)
from product_units u
cross join (values (5, .96), (20, .92)) t(min_qty, factor)
where not exists (select 1 from price_tiers x where x.product_unit_id = u.id and x.min_qty = t.min_qty);

insert into product_costs(product_id, fob_usd, freight_usd, insurance_usd, duty_rate, excise_rate)
select p.id, c.fob, c.freight, c.insurance, c.duty, c.excise
from seed_catalog c
join products p on p.trader_id = c.trader_id and p.name = c.name
where c.imported
  and not exists (select 1 from product_costs pc where pc.product_id = p.id);

-- Stock in base units. Two lines start low, so "restock soon" has something to show.
insert into stock(location_id, product_id, qty)
select l.id, p.id,
       u.base_qty * case when p.name = 'Wheel Bearing' then 6
                         when p.name = 'Vacuum Flask'  then 9
                         else 40 + abs(hashtext(p.id::text)) % 80 end
from products p
join locations l on l.trader_id = p.trader_id
join product_units u on u.product_id = p.id
where not exists (select 1 from stock s where s.location_id = l.id and s.product_id = p.id);

-- 7. People: buyers and brokers (phone numbers use an invalid range on purpose) -----
insert into buyers(name, business_name, phone, area, credit_limit)
select format('%s %s (demo)',
              (array['Abel','Bethel','Chala','Dina','Eyob','Fikir','Genet','Habtamu','Iman','Kidus'])[1 + (g.n - 1) % 10],
              (array['Alemu','Bekele','Chane','Degu','Eshetu','Fanta','Girma'])[1 + (g.n * 3) % 7]),
       format('%s General Store (demo)', (array['Alemu','Bekele','Chane','Degu','Eshetu','Fanta','Girma'])[1 + (g.n * 3) % 7]),
       format('+251 000 000 %s', lpad(g.n::text, 3, '0')),
       (array['Piazza','Bole','Merkato','Kazanchis'])[1 + g.n % 4],
       50000 + (g.n % 5) * 10000
from generate_series(1, 20) g(n)
where not exists (select 1 from buyers where name like '%(demo)');

insert into brokers(name, phone, default_commission_pct)
select x.name, null, x.pct
from (values ('Broker Hana (demo)', 2.0), ('Broker Bekele (demo)', 1.5), ('Broker Mulu (demo)', 2.5)) x(name, pct)
where not exists (select 1 from brokers b where b.name = x.name);

-- 8. Price board: 60 days per terra, drifting up with a small wave -------------------
insert into price_board(terra_id, item_name, unit, price, price_date)
select te.id, x.item, x.unit,
       round((x.base * (1 + 0.0012 * (60 - d.day) + 0.02 * sin(d.day / 6.0))) / 5) * 5,
       current_date - d.day
from (values
  ('Somali',   'Brake pad set',          'piece',  2650),
  ('Shema',    'Cotton fabric roll',     'roll',   3900),
  ('Termus',   'Vacuum flask carton',    'carton', 2350),
  ('Kimem',    'Berbere sack',           'sack',   4800),
  ('Minalesh', 'Mixed household carton', 'carton', 1450)
) x(terra, item, unit, base)
join terras te on te.name = x.terra
cross join generate_series(0, 59) d(day)
where not exists (
  select 1 from price_board pb
  where pb.terra_id = te.id and pb.item_name = x.item and pb.price_date = current_date - d.day);

-- 9. 150 historical orders (skipped if demo orders already exist) --------------------
drop table if exists seed_orders;
create table seed_orders as
with t as (select id, vat_registered, row_number() over (order by id) rn, count(*) over () cnt
           from traders where verified),
     b as (select id, row_number() over (order by id) rn, count(*) over () cnt from buyers),
     r as (select id, row_number() over (order by id) rn, count(*) over () cnt from brokers),
     u as (select pu.id unit_id, p.trader_id, pu.retail_price, pu.min_order_qty,
                  row_number() over (partition by p.trader_id order by p.id) rn,
                  count(*) over (partition by p.trader_id) cnt
           from product_units pu join products p on p.id = pu.product_id)
select g.n,
       g.n % 60 as days_ago,
       case when g.n % 10 = 0 then 0 when g.n % 10 in (1, 2) then 1 else 2 end as g_status,
       t.id as trader_id,
       t.vat_registered,
       b.id as buyer_id,
       case when g.n % 3 <> 0 then r.id end as broker_id,
       u.unit_id,
       u.min_order_qty * (1 + g.n % 4) as qty,
       round(u.retail_price * case when u.min_order_qty * (1 + g.n % 4) >= 20 then .92
                                   when u.min_order_qty * (1 + g.n % 4) >= 5 then .96
                                   else 1 end, 2) as unit_price
from generate_series(1, 150) g(n)
join t on t.rn = ((g.n - 1) % t.cnt) + 1
join b on b.rn = ((g.n * 7) % b.cnt) + 1
join r on r.rn = ((g.n * 3) % r.cnt) + 1
join u on u.trader_id = t.id and u.rn = ((g.n * 5) % u.cnt) + 1
where not exists (select 1 from orders where invoice_no like 'DEMO-%');

insert into orders(trader_id, buyer_id, broker_id, status, payment_terms, transfer_reference, due_date,
                   delivery_type, delivery_fee, subtotal, vat, total, invoice_no, created_at)
select o.trader_id, o.buyer_id, o.broker_id,
       case o.g_status when 0 then 'cancelled' when 1 then 'new'
            else case when o.n % 3 = 0 then 'fulfilled' else 'confirmed' end end,
       case o.n % 4 when 0 then 'credit' when 1 then 'transfer' when 2 then 'mobile_money' else 'cash' end,
       case when o.n % 4 = 1 then format('DEMO-REF-%s', o.n) end,
       case when o.n % 4 = 0
            then (current_date - o.days_ago) + (array[7, 14, 30])[1 + o.n % 3] end,
       case o.n % 3 when 0 then 'porter' when 1 then 'truck' else 'pickup' end,
       case o.n % 3 when 0 then 45 when 1 then 180 else 0 end,
       round(o.qty * o.unit_price, 2),
       case when o.vat_registered then round(o.qty * o.unit_price * .15, 2) else 0 end,
       round(o.qty * o.unit_price, 2)
         + case when o.vat_registered then round(o.qty * o.unit_price * .15, 2) else 0 end
         + case o.n % 3 when 0 then 45 when 1 then 180 else 0 end,
       format('DEMO-%s-%s', to_char(current_date - o.days_ago, 'YYMMDD'), lpad(o.n::text, 3, '0')),
       (current_date - o.days_ago)::timestamp + interval '9 hours' + (o.n % 8) * interval '1 hour'
from seed_orders o;

insert into order_items(order_id, product_unit_id, quantity, unit_price)
select ord.id, o.unit_id, o.qty, o.unit_price
from seed_orders o
join orders ord on ord.invoice_no = format('DEMO-%s-%s', to_char(current_date - o.days_ago, 'YYMMDD'), lpad(o.n::text, 3, '0'))
where not exists (select 1 from order_items i where i.order_id = ord.id);

-- Paid orders get a full payment, a third of credit orders get a 35% part payment.
insert into payments(order_id, method, amount, reference, paid_at)
select ord.id,
       case ord.payment_terms when 'cash' then 'cash' when 'transfer' then 'bank'
                              when 'mobile_money' then 'telebirr' else 'other' end,
       case when ord.payment_terms = 'credit' then round(ord.total * .35, 2) else ord.total end,
       ord.transfer_reference,
       least(ord.created_at + interval '1 day', now())
from orders ord
where ord.invoice_no like 'DEMO-%'
  and ord.status in ('confirmed', 'fulfilled')
  and (ord.payment_terms <> 'credit' or abs(hashtext(ord.id::text)) % 3 = 0)
  and not exists (select 1 from payments p where p.order_id = ord.id);

-- Broker commission on confirmed or fulfilled orders that had a broker.
insert into broker_commissions(order_id, broker_id, pct, amount, status)
select ord.id, ord.broker_id, b.default_commission_pct,
       round(ord.subtotal * b.default_commission_pct / 100, 2),
       case when ord.status = 'fulfilled' then 'paid' else 'pending' end
from orders ord
join brokers b on b.id = ord.broker_id
where ord.invoice_no like 'DEMO-%' and ord.status in ('confirmed', 'fulfilled')
on conflict (order_id) do nothing;

-- Take sold quantities out of stock (only for orders created by this run).
-- If your database already has a trigger that deducts stock on insert, remove this block.
update stock st set qty = greatest(0, st.qty - sold.quantity)
from (select pu.product_id, sum(i.quantity * pu.base_qty) as quantity
      from order_items i
      join orders o on o.id = i.order_id
      join product_units pu on pu.id = i.product_unit_id
      where o.invoice_no like 'DEMO-%' and o.status in ('confirmed', 'fulfilled')
        and exists (select 1 from seed_orders)
      group by pu.product_id) sold
where st.product_id = sold.product_id;

-- Clean up the staging tables
drop table if exists seed_catalog;
drop table if exists seed_orders;