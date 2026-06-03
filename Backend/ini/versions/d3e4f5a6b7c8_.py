"""Añade campos de ubicación y contacto adicional al modelo Foundation

Revision ID: d3e4f5a6b7c8
Revises: c9a8b7d6e5f4
Create Date: 2026-06-03 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd3e4f5a6b7c8'
down_revision: Union[str, Sequence[str], None] = 'c9a8b7d6e5f4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── Ubicación ──────────────────────────────────────────────────────────────
    op.add_column('foundations', sa.Column('address',     sa.String(length=255), nullable=True))
    op.add_column('foundations', sa.Column('state',       sa.String(length=80),  nullable=True))
    op.add_column('foundations', sa.Column('postal_code', sa.String(length=10),  nullable=True))

    # ── Contacto adicional ─────────────────────────────────────────────────────
    op.add_column('foundations', sa.Column('whatsapp',    sa.String(length=30),  nullable=True))
    op.add_column('foundations', sa.Column('website',     sa.String(length=255), nullable=True))
    op.add_column('foundations', sa.Column('responsible', sa.String(length=120), nullable=True))


def downgrade() -> None:
    op.drop_column('foundations', 'responsible')
    op.drop_column('foundations', 'website')
    op.drop_column('foundations', 'whatsapp')
    op.drop_column('foundations', 'postal_code')
    op.drop_column('foundations', 'state')
    op.drop_column('foundations', 'address')
