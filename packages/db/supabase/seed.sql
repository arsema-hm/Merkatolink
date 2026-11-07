-- Fictional data only: names, traders, prices, buyers and rates are invented for this demo.
insert into terras(name,name_am,description,icon) values
('Shema','ሸማ','Traditional cloth, textiles and everyday fabrics.','▧'),('Kimem','ቅመም','Spices, seasonings and pantry staples.','✳'),('Somali','ሶማሌ','Imported vehicle and machine parts.','⚙'),('Termus','ቴርሙስ','Bottles, containers and household goods.','◉'),('Minalesh','ምን አለሽ','A little of everything: mixed goods and useful finds.','✦') on conflict(name) do nothing;
insert into traders(terra_id,name,owner_name,shop_no,landmark,vat_registered,verified,tagline) select t.id,x.name,x.owner,x.shop,x.landmark,x.vat,true,x.tag from (values
('Shema','Lomi Textiles (demo)','Mekdes (demo)','S-14','North gate, blue awning',true,'Woven with care, sold by the roll.'),('Shema','Aster Loom House (demo)','Hana (demo)','S-22','Near the fabric lane',false,'Cloth for every day.'),('Kimem','Buna & Berbere (demo)','Dawit (demo)','K-08','Spice row, corner stall',true,'Ground fresh, shared generously.'),('Kimem','Mekdes Pantry (demo)','Selam (demo)','K-17','Beside the grain scale',false,'Staples from familiar hands.'),('Somali','Abay Auto Supply (demo)','Yonas (demo)','SO-31','East entry, second aisle',true,'Parts that keep you moving.'),('Somali','Blue Nile Bearings (demo)','Rahel (demo)','SO-44','Across the porter crossing',false,'Reliable parts, fair terms.'),('Termus','Saba Housewares (demo)','Mimi (demo)','T-12','Central lane, green sign',true,'Useful things for the home.'),('Minalesh','Enat Mixed Goods (demo)','Biniam (demo)','M-06','Old stone marker, row three',false,'What might you find today?')) x(terra,name,owner,shop,landmark,vat,tag) join terras t on t.name=x.terra where not exists(select 1 from traders z where z.name=x.name);
insert into exchange_rates(rate_date,usd_etb,source) select current_date-(89-i),case when i<30 then 132.5+i*.12 when i<60 then 136.1+(i-30)*.17 else 141.2+(i-60)*.22 end,'fictional demo rate' from generate_series(0,89)i where not exists(select 1 from exchange_rates);
insert into tax_settings(name,rate,base,sort_order,effective_from) values('VAT',.15,'cif_duty',30,current_date-90),('Surtax',.10,'running_total',40,current_date-90),('Withholding',.03,'cif',50,current_date-90),('Clearing USD',12,'custom',60,current_date-90) on conflict(name,effective_from) do nothing;
insert into locations(trader_id,name,type) select id,'Shop floor','shop' from traders where not exists(select 1 from locations l where l.trader_id=traders.id);
insert into products(trader_id,name,category,base_unit,is_imported,target_margin) select t.id,x.name,x.category,x.unit,x.imported,x.margin from (values
('Abay Auto Supply (demo)','Brake Pad Set','Spare parts','piece',true,25),('Abay Auto Supply (demo)','Wheel Bearing','Spare parts','piece',true,28),('Blue Nile Bearings (demo)','Engine Oil 4L','Spare parts','carton',true,22),('Saba Housewares (demo)','Vacuum Flask','Bottles & containers','carton',true,24),('Saba Housewares (demo)','Glass Water Bottle','Bottles & containers','piece',true,25),('Lomi Textiles (demo)','Cotton Shema Roll','Textiles','roll',true,30),('Aster Loom House (demo)','Daily Cotton Wrap','Textiles','piece',false,20),('Buna & Berbere (demo)','Berbere Spice Sack','Spices','sack',false,20),('Mekdes Pantry (demo)','Red Lentils','Grains','quintal',false,18),('Enat Mixed Goods (demo)','Metal Storage Tin','Household','carton',true,25)) x(trader,name,category,unit,imported,margin) join traders t on t.name=x.trader where not exists(select 1 from products p where p.trader_id=t.id and p.name=x.name);
insert into product_units(product_id,unit_name,base_qty,min_order_qty,retail_price) select p.id,p.base_unit,case p.base_unit when 'carton' then 12 when 'sack' then 50 when 'quintal' then 100 else 1 end,1,case p.category when 'Spare parts' then 1450 when 'Bottles & containers' then 2300 when 'Textiles' then 3800 when 'Spices' then 4600 when 'Grains' then 6100 else 780 end from products p where not exists(select 1 from product_units u where u.product_id=p.id);
insert into price_tiers(product_unit_id,min_qty,price) select id,5,round(retail_price*.94,2) from product_units where not exists(select 1 from price_tiers t where t.product_unit_id=product_units.id);
insert into stock(location_id,product_id,qty) select l.id,p.id,case when p.name like '%Bearing%' then 6 else 28 end from products p join locations l on l.trader_id=p.trader_id where not exists(select 1 from stock s where s.location_id=l.id and s.product_id=p.id);
insert into product_costs(product_id,fob_usd,freight_usd,insurance_usd,duty_rate,excise_rate) select id,case when name like '%Brake%' then 18 when name like '%Bearing%' then 11 when name like '%Oil%' then 9 when name like '%Flask%' then 4 when name like '%Bottle%' then 2 when name like '%Textile%' then 3 else 0 end,2,.3,.15,.05 from products where is_imported and not exists(select 1 from product_costs c where c.product_id=products.id);
-- Fill out a synthetic catalog, marketplace participants, and 150 historical orders.
insert into products(trader_id,name,category,base_unit,is_imported,target_margin)
select t.id,format('%s demo line %s',t.name,g.n),
 case when terra.name='Somali' then 'Spare parts' when terra.name='Shema' then 'Textiles' when terra.name='Termus' then 'Bottles & containers' when terra.name='Kimem' then 'Spices & staples' else 'Mixed goods' end,
 case when terra.name='Somali' then 'piece' when terra.name='Shema' then 'roll' when terra.name='Termus' then 'carton' when terra.name='Kimem' then 'sack' else 'piece' end,
 terra.name in('Somali','Shema','Termus'),20
from traders t join terras terra on terra.id=t.terra_id cross join generate_series(1,6) g(n)
where not exists(select 1 from products p where p.trader_id=t.id and p.name=format('%s demo line %s',t.name,g.n));
insert into product_units(product_id,unit_name,base_qty,min_order_qty,retail_price)
select p.id,p.base_unit,case p.base_unit when 'carton' then 12 when 'sack' then 50 when 'quintal' then 100 else 1 end,1,case p.category when 'Spare parts' then 950+((row_number() over(order by p.id)::int%13)*125) when 'Textiles' then 1800+((row_number() over(order by p.id)::int%11)*210) when 'Bottles & containers' then 700+((row_number() over(order by p.id)::int%9)*95) else 250+((row_number() over(order by p.id)::int%17)*45) end
from products p where not exists(select 1 from product_units u where u.product_id=p.id);
insert into price_tiers(product_unit_id,min_qty,price) select id,5,round(retail_price*.94,2) from product_units u where not exists(select 1 from price_tiers x where x.product_unit_id=u.id);
insert into stock(location_id,product_id,qty) select l.id,p.id,18+(row_number() over(order by p.id)::int%21) from products p join locations l on l.trader_id=p.trader_id where not exists(select 1 from stock s where s.location_id=l.id and s.product_id=p.id);
insert into product_costs(product_id,fob_usd,freight_usd,insurance_usd,duty_rate,excise_rate) select p.id,3+(row_number() over(order by p.id)::int%22),1.5,.2,.15,.05 from products p where p.is_imported and not exists(select 1 from product_costs c where c.product_id=p.id);
insert into buyers(name,business_name,phone,area,credit_limit)
select format('Retail buyer %s (demo)',g.n),format('Neighborhood shop %s (demo)',g.n),format('+251900000%s',g.n),case g.n%4 when 0 then 'Piazza' when 1 then 'Bole' when 2 then 'Merkato' else 'Kazanchis' end,50000+(g.n%5)*10000
from generate_series(1,20) g(n) where not exists(select 1 from buyers b where b.name=format('Retail buyer %s (demo)',g.n));
insert into brokers(name,phone,default_commission_pct)
select x.name,null,x.pct from (values('Broker Hana (demo)',2.0),('Broker Bekele (demo)',1.5),('Broker Mulu (demo)',2.5)) x(name,pct)
where not exists(select 1 from brokers b where b.name=x.name);
insert into price_board(terra_id,item_name,unit,price,price_date)
select t.id,case t.name when 'Somali' then 'Brake pad set' when 'Shema' then 'Cotton fabric roll' when 'Termus' then 'Vacuum flask carton' when 'Kimem' then 'Berbere sack' else 'Mixed household carton' end,
 case t.name when 'Kimem' then 'sack' when 'Shema' then 'roll' else 'carton' end,
 1500+(g.day*13)+(t.id*37),current_date-g.day
from terras t cross join generate_series(0,59) g(day)
where not exists(select 1 from price_board pb where pb.terra_id=t.id and pb.price_date=current_date-g.day and pb.item_name=case t.name when 'Somali' then 'Brake pad set' when 'Shema' then 'Cotton fabric roll' when 'Termus' then 'Vacuum flask carton' when 'Kimem' then 'Berbere sack' else 'Mixed household carton' end);
do $$ begin
 if not exists(select 1 from orders) then
  insert into orders(trader_id,buyer_id,broker_id,status,payment_terms,transfer_reference,due_date,delivery_type,delivery_fee,subtotal,vat,total,invoice_no,created_at)
  select tr.id,byr.id,br.id,
   case g.n%10 when 0 then 'cancelled' when 1 then 'new' when 2 then 'new' else case when g.n%3=0 then 'fulfilled' else 'confirmed' end end,
   case g.n%4 when 0 then 'credit' when 1 then 'transfer' when 2 then 'mobile_money' else 'cash' end,
   case when g.n%4=1 then format('DEMO-REF-%s',g.n) end,
   case when g.n%4=0 then current_date-(g.n%50)+7 else null end,
   case g.n%3 when 0 then 'porter' when 1 then 'truck' else 'pickup' end,
   case g.n%3 when 0 then 45 when 1 then 180 else 0 end,
   amount.subtotal,case when tr.vat_registered then round(amount.subtotal*.15,2) else 0 end,
   amount.subtotal+case when tr.vat_registered then round(amount.subtotal*.15,2) else 0 end,
   format('DEMO-%s-%s',to_char(current_date-(g.n%60),'YYMMDD'),g.n),now()-((g.n%60)||' days')::interval
  from generate_series(1,150) g(n)
  join lateral(select id from traders order by id offset ((g.n-1)%greatest((select count(*) from traders),1)) limit 1) tr on true
  join lateral(select id from buyers order by id offset ((g.n*7)%greatest((select count(*) from buyers),1)) limit 1) byr on true
  left join lateral(select id from brokers order by id offset ((g.n*3)%greatest((select count(*) from brokers),1)) limit 1) br on g.n%3<>0
  cross join lateral(select 1200+(g.n%37)*135 as subtotal) amount;
  insert into order_items(order_id,product_unit_id,quantity,unit_price)
  select o.id,u.id,1+(row_number() over(order by o.created_at,o.id)::int%4),round(o.subtotal/(1+(row_number() over(order by o.created_at,o.id)::int%4)),2)
  from orders o join lateral(select pu.id from product_units pu join products p on p.id=pu.product_id where p.trader_id=o.trader_id order by p.id offset (abs(hashtext(o.id::text))%greatest((select count(*) from products p2 where p2.trader_id=o.trader_id),1)) limit 1) u on true;
  update stock st set qty=greatest(0,st.qty-sold.quantity) from (select pu.product_id,sum(oi.quantity*pu.base_qty) quantity from order_items oi join orders o on o.id=oi.order_id join product_units pu on pu.id=oi.product_unit_id where o.invoice_no like 'DEMO-%' and o.status in('confirmed','fulfilled') group by pu.product_id) sold where st.product_id=sold.product_id;  insert into payments(order_id,method,amount,reference,paid_at)
  select o.id,case o.payment_terms when 'cash' then 'cash' when 'transfer' then 'bank' when 'mobile_money' then 'telebirr' else 'other' end,
   case when o.payment_terms='credit' then case when abs(hashtext(o.id::text))%3=0 then round(o.total*.35,2) else 0 end else o.total end,
   o.transfer_reference,o.created_at+interval '1 day'
  from orders o where o.invoice_no like 'DEMO-%' and (o.payment_terms<>'credit' or abs(hashtext(o.id::text))%3=0);
  insert into broker_commissions(order_id,broker_id,pct,amount,status)
  select o.id,o.broker_id,b.default_commission_pct,round(o.subtotal*b.default_commission_pct/100,2),case when o.status='fulfilled' then 'paid' else 'pending' end
  from orders o join brokers b on b.id=o.broker_id where o.invoice_no like 'DEMO-%' and o.status in('confirmed','fulfilled') on conflict(order_id) do nothing;
 end if;
end $$;
