import uuid

from app.schemas.common import ORMModel
from app.schemas.product import ProductCardOut


class WishlistItemOut(ORMModel):
    id: uuid.UUID
    product: ProductCardOut
