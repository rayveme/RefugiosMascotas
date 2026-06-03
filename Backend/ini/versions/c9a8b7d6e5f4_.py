"""Añade campos de perfil del hogar y documentos al modelo Adopter

Revision ID: c9a8b7d6e5f4
Revises: 386e7ce18841
Create Date: 2026-06-02 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c9a8b7d6e5f4'
down_revision: Union[str, Sequence[str], None] = '386e7ce18841'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── Perfil del hogar ──────────────────────────────────────────────────────
    op.add_column('adopters', sa.Column('housing_type',    sa.String(length=50),   nullable=True))
    op.add_column('adopters', sa.Column('has_garden',      sa.Boolean(),           nullable=True))
    op.add_column('adopters', sa.Column('has_children',    sa.Boolean(),           nullable=True))
    op.add_column('adopters', sa.Column('has_other_pets',  sa.Boolean(),           nullable=True))
    op.add_column('adopters', sa.Column('other_pets_desc', sa.String(length=500),  nullable=True))
    op.add_column('adopters', sa.Column('adoption_reason', sa.Text(),              nullable=True))

    # ── Documentos (URLs de Cloudinary) ───────────────────────────────────────
    op.add_column('adopters', sa.Column('id_front_url',      sa.String(length=500),  nullable=True))
    op.add_column('adopters', sa.Column('id_back_url',       sa.String(length=500),  nullable=True))
    op.add_column('adopters', sa.Column('proof_address_url', sa.String(length=500),  nullable=True))
    op.add_column('adopters', sa.Column('home_photo_urls',   sa.String(length=2000), nullable=True))
    op.add_column('adopters', sa.Column('signature_url',     sa.String(length=500),  nullable=True))


def downgrade() -> None:
    op.drop_column('adopters', 'signature_url')
    op.drop_column('adopters', 'home_photo_urls')
    op.drop_column('adopters', 'proof_address_url')
    op.drop_column('adopters', 'id_back_url')
    op.drop_column('adopters', 'id_front_url')
    op.drop_column('adopters', 'adoption_reason')
    op.drop_column('adopters', 'other_pets_desc')
    op.drop_column('adopters', 'has_other_pets')
    op.drop_column('adopters', 'has_children')
    op.drop_column('adopters', 'has_garden')
    op.drop_column('adopters', 'housing_type')
