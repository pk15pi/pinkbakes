"""
Deterministic, idempotent seed data for the isolated E2E database.

Orders are created through the real API views (checkout -> mocked payment
signature -> admin status transitions) so seeded data follows business rules.
All accounts are local test accounts in a throw-away SQLite file.
"""
import datetime as dt
import hashlib
import hmac
import json
import os
from decimal import Decimal
from pathlib import Path

PASSWORD = os.environ.get('PB_E2E_PASSWORD', 'E2e-Local-Only-9431')
ADMIN_PASSWORD = os.environ.get('PB_E2E_ADMIN_PASSWORD', 'E2e-Admin-Local-7720')
ZONE_PIN = '122001'

CUSTOMERS = {
    'a': dict(username='e2e_alice', email='alice.e2e@example.test', first_name='Alice', last_name='Tester', mobile='9000000001'),
    'b': dict(username='e2e_bob', email='bob.e2e@example.test', first_name='Bob', last_name='Tester', mobile='9000000002'),
}
ADMIN = dict(username='e2e_admin', email='admin.e2e@example.test')

PRODUCTS = [
    dict(name='E2E Chocolate Truffle Cake', category='Birthday Cakes', price='800.00', discount=0,
         size_prices={'0.5 kg': '500.00', '1 kg': '800.00', '2 kg': '1500.00'}, featured=True, available_quantity=200),
    dict(name='E2E Red Velvet Cake', category='Anniversary Cakes', price='900.00', discount=10,
         size_prices={}, featured=True, available_quantity=200),
    dict(name='E2E Butterscotch Cake', category='Birthday Cakes', price='650.00', discount=0,
         size_prices={}, available_quantity=200),
    dict(name='E2E Sold Out Cake', category='Wedding Cakes', price='2000.00', discount=0,
         size_prices={}, availability='out_of_stock', available_quantity=0),
]


def _client(user):
    from rest_framework.test import APIClient
    c = APIClient()
    c.force_authenticate(user=user)
    return c


def _sign(order_id, payment_id):
    from django.conf import settings
    return hmac.new(settings.RAZORPAY_KEY_SECRET.encode(), f'{order_id}|{payment_id}'.encode(), hashlib.sha256).hexdigest()


def _make_customer(spec):
    from django.contrib.auth.models import User
    from accounts.models import UserProfile, CustomerAddress
    user, created = User.objects.get_or_create(username=spec['username'], defaults=dict(
        email=spec['email'], first_name=spec['first_name'], last_name=spec['last_name'], is_active=True))
    if created:
        user.set_password(PASSWORD)
        user.save()
    UserProfile.objects.update_or_create(user=user, defaults=dict(
        mobile_number=spec['mobile'], is_verified=True, email_verified=True, mobile_verified=True))
    if not CustomerAddress.objects.filter(user=user).exists():
        CustomerAddress.objects.create(
            user=user, full_name=f"{spec['first_name']} {spec['last_name']}", mobile_number=spec['mobile'],
            address_line_1=f"{spec['first_name']} House, Test Street 1", city='Gurugram', state='Haryana',
            postal_code=ZONE_PIN, is_default=True)
    return user


def seed():
    from django.contrib.auth.models import User
    from catalog.models import (Product, Coupon, DeliveryZone, DeliverySettings, DeliverySlot,
                                GalleryItem, Testimonial, Order, Review)

    if User.objects.filter(username=ADMIN['username']).exists():
        _write_meta()
        return

    admin = User.objects.create_user(username=ADMIN['username'], email=ADMIN['email'], password=ADMIN_PASSWORD,
                                     is_staff=True, is_superuser=True)
    users = {k: _make_customer(v) for k, v in CUSTOMERS.items()}

    for spec in PRODUCTS:
        Product.objects.get_or_create(name=spec['name'], defaults=dict(
            short_description=f"{spec['name']} - seeded for local E2E tests.",
            description='Moist sponge layered with cream. Local test product.',
            main_image='', **{k: v for k, v in spec.items() if k != 'name'}))

    s = DeliverySettings.objects.first() or DeliverySettings.objects.create()
    s.delivery_enabled = True
    s.default_delivery_charge = Decimal('0')
    s.save()
    DeliveryZone.objects.get_or_create(name='E2E Gurugram', defaults=dict(
        postal_codes=[ZONE_PIN], city='Gurugram', state='Haryana', delivery_charge=Decimal('50.00'),
        minimum_order_amount=Decimal('0'), free_delivery_threshold=Decimal('2000.00'),
        eta_min_minutes=60, eta_max_minutes=120))
    for i, (label, a, b) in enumerate([('Morning (9 AM - 12 PM)', 9, 12), ('Evening (5 PM - 8 PM)', 17, 20)]):
        DeliverySlot.objects.get_or_create(label=label, defaults=dict(
            start_time=dt.time(a), end_time=dt.time(b), sort_order=i))
    Coupon.objects.get_or_create(code='E2ESAVE10', defaults=dict(
        name='E2E 10% off', discount_type='percentage', discount_value=Decimal('10'),
        minimum_order_amount=Decimal('100'), is_active=True))
    GalleryItem.objects.get_or_create(alt_text='E2E gallery cake', defaults=dict(
        image_url='https://example.test/gallery.jpg', caption='E2E gallery'))
    Testimonial.objects.get_or_create(name='E2E Reviewer', defaults=dict(text='Lovely cake (seeded).', tag='Birthday'))

    choc = Product.objects.get(name='E2E Chocolate Truffle Cake')
    velvet = Product.objects.get(name='E2E Red Velvet Cake')
    staff = _client(admin)

    def place(user, items, final_status=None, pay=True, cancel=False):
        c = _client(user)
        addr = user.addresses.first()
        r = c.post('/api/payments/create/', {'items': items, 'address_id': addr.id,
                                             'customer_email': user.email}, format='json')
        assert r.status_code == 200, (r.status_code, r.content[:300])
        info = r.json()
        if pay:
            pid = f"pay_e2e_{info['order_id']}"
            v = c.post('/api/payments/verify/', {
                'razorpay_order_id': info['payment_order_id'], 'razorpay_payment_id': pid,
                'razorpay_signature': _sign(info['payment_order_id'], pid), 'amount': info['amount']}, format='json')
            assert v.status_code == 200, v.content[:300]
        order = Order.objects.get(id=info['order_id'])
        path = ['PREPARING', 'PACKING', 'READY_FOR_DELIVERY', 'DELIVERY_BOY_ASSIGNED', 'OUT_FOR_DELIVERY', 'DELIVERED']
        if final_status:
            for st in path:
                order.refresh_from_db()
                if order.status == final_status:
                    break
                if st == 'DELIVERY_BOY_ASSIGNED':
                    continue
                r = staff.patch(f'/api/admin/orders/{order.id}/status/', {'status': st}, format='json')
                if r.status_code != 200:
                    break
        if cancel:
            c.post(f'/api/orders/{order.id}/cancel/', {'reason': 'E2E seeded cancellation'}, format='json')
        return order

    place(users['a'], [{'id': choc.id, 'quantity': 1, 'options': {'size': '1 kg'}}])
    place(users['a'], [{'id': velvet.id, 'quantity': 2}], final_status='PACKING')
    place(users['a'], [{'id': choc.id, 'quantity': 1, 'options': {'size': '2 kg'}}], pay=False)
    place(users['b'], [{'id': velvet.id, 'quantity': 1}], final_status='READY_FOR_DELIVERY')
    place(users['b'], [{'id': choc.id, 'quantity': 1, 'options': {'size': '0.5 kg'}}], cancel=True)

    Review.objects.get_or_create(product=choc, user=users['a'], defaults=dict(
        name='Alice', rating=5, comment='Great seeded cake', status='approved'))
    Review.objects.get_or_create(product=velvet, user=users['b'], defaults=dict(
        name='Bob', rating=4, comment='Pending seeded review', status='pending'))
    _write_meta()


def _write_meta():
    """Expose non-secret ids for the Playwright suite."""
    from catalog.models import Order, Product
    from django.contrib.auth.models import User
    tmp = Path(os.environ['PB_E2E_TMP'])
    meta = {
        'zonePin': ZONE_PIN,
        'customers': {k: {'username': v['username'], 'email': v['email'],
                          'orders': list(Order.objects.filter(user__username=v['username']).order_by('id').values_list('id', flat=True))}
                      for k, v in CUSTOMERS.items()},
        'admin': {'username': ADMIN['username'], 'email': ADMIN['email']},
        'products': {p.name: {'id': p.id, 'slug': p.slug} for p in Product.objects.all()},
        'coupon': 'E2ESAVE10',
    }
    (tmp / 'seed_meta.json').write_text(json.dumps(meta, indent=2))
