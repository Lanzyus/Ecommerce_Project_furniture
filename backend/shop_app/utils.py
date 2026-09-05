from uuid import uuid4
from datetime import timedelta

from django.utils import timezone

from .models import (
    Courier,
    Shipment,
    ShipmentTracking,
)


def create_shipment(order):
    """
    Create shipment immediately after payment.
    """

    courier = Courier.objects.filter(
        active=True
    ).first()

    if courier is None:
        raise Exception(
            "No active courier found."
        )

    shipment = Shipment.objects.create(

        order=order,

        courier=courier,

        tracking_number=str(uuid4()).replace("-", "")[:12].upper(),

        receiver_name=order.full_name,

        receiver_phone=order.phone,

        receiver_address=order.address,

        estimated_delivery=timezone.now().date()
        + timedelta(days=5),

        status="processing",
    )

    ShipmentTracking.objects.create(

        shipment=shipment,

        status="Processing",

        location="Main Warehouse",

        note="Shipment created successfully.",

    )

    return shipment