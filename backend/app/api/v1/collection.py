from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security.deps import CurrentUser
from app.core.security.permissions import LibraryOwner, CollectionOwner
from app.schemas.collection import (
    BookCreate, BookUpdate, BookResponse,
    MagazineCreate, MagazineUpdate, MagazineResponse,
    CDCreate, CDUpdate, CDResponse,
    VinylRecordCreate, VinylRecordUpdate, VinylRecordResponse,
    DVDCreate, DVDUpdate, DVDResponse,
    GameCartridgeCreate, GameCartridgeUpdate, GameCartridgeResponse
)
from app.services.collection import (
    book_service, magazine_service, cd_service,
    vinyl_record_service, dvd_service, game_cartridge_service
)

router = APIRouter()

# Book endpoints
@router.post("/libraries/{library_id}/books", response_model=BookResponse)
async def create_book(
    library_id: int,
    book: BookCreate,
    current_user: CurrentUser,
    _: LibraryOwner,
    db: Session = Depends(get_db)
):
    return book_service.create(db, library_id=library_id, obj_in=book)

@router.get("/libraries/{library_id}/books", response_model=List[BookResponse])
async def list_books(
    library_id: int,
    current_user: CurrentUser,
    _: LibraryOwner,
    db: Session = Depends(get_db),
    keyword: str = ""
):
    return book_service.get_multi(db, library_id=library_id, keyword=keyword)

@router.get("/books/{book_id}", response_model=BookResponse)
async def get_book(
    book_id: int,
    current_user: CurrentUser,
    _: CollectionOwner = Depends(lambda book_id=book_id: verify_collection_owner(book_id, "book")),
    db: Session = Depends(get_db)
):
    return book_service.get(db, id=book_id)

@router.put("/books/{book_id}", response_model=BookResponse)
async def update_book(
    book_id: int,
    book: BookUpdate,
    current_user: CurrentUser,
    _: CollectionOwner = Depends(lambda book_id=book_id: verify_collection_owner(book_id, "book")),
    db: Session = Depends(get_db)
):
    return book_service.update(db, id=book_id, obj_in=book)

@router.delete("/books/{book_id}")
async def delete_book(
    book_id: int,
    current_user: CurrentUser,
    _: CollectionOwner = Depends(lambda book_id=book_id: verify_collection_owner(book_id, "book")),
    db: Session = Depends(get_db)
):
    book_service.remove(db, id=book_id)
    return {"message": "Book deleted successfully"}

# Magazine endpoints
@router.post("/libraries/{library_id}/magazines", response_model=MagazineResponse)
async def create_magazine(
    library_id: int,
    magazine: MagazineCreate,
    current_user: CurrentUser,
    _: LibraryOwner,
    db: Session = Depends(get_db)
):
    return magazine_service.create(db, library_id=library_id, obj_in=magazine)

@router.get("/libraries/{library_id}/magazines", response_model=List[MagazineResponse])
async def list_magazines(
    library_id: int,
    current_user: CurrentUser,
    _: LibraryOwner,
    db: Session = Depends(get_db),
    keyword: str = ""
):
    return magazine_service.get_multi(db, library_id=library_id, keyword=keyword)

@router.get("/magazines/{magazine_id}", response_model=MagazineResponse)
async def get_magazine(
    magazine_id: int,
    current_user: CurrentUser,
    _: CollectionOwner = Depends(lambda magazine_id=magazine_id: verify_collection_owner(magazine_id, "magazine")),
    db: Session = Depends(get_db)
):
    return magazine_service.get(db, id=magazine_id)

@router.put("/magazines/{magazine_id}", response_model=MagazineResponse)
async def update_magazine(
    magazine_id: int,
    magazine: MagazineUpdate,
    current_user: CurrentUser,
    _: CollectionOwner = Depends(lambda magazine_id=magazine_id: verify_collection_owner(magazine_id, "magazine")),
    db: Session = Depends(get_db)
):
    return magazine_service.update(db, id=magazine_id, obj_in=magazine)

@router.delete("/magazines/{magazine_id}")
async def delete_magazine(
    magazine_id: int,
    current_user: CurrentUser,
    _: CollectionOwner = Depends(lambda magazine_id=magazine_id: verify_collection_owner(magazine_id, "magazine")),
    db: Session = Depends(get_db)
):
    magazine_service.remove(db, id=magazine_id)
    return {"message": "Magazine deleted successfully"}

# CD endpoints
@router.post("/libraries/{library_id}/cds", response_model=CDResponse)
async def create_cd(
    library_id: int,
    cd: CDCreate,
    current_user: CurrentUser,
    _: LibraryOwner,
    db: Session = Depends(get_db)
):
    return cd_service.create(db, library_id=library_id, obj_in=cd)

@router.get("/libraries/{library_id}/cds", response_model=List[CDResponse])
async def list_cds(
    library_id: int,
    current_user: CurrentUser,
    _: LibraryOwner,
    db: Session = Depends(get_db),
    keyword: str = ""
):
    return cd_service.get_multi(db, library_id=library_id, keyword=keyword)

@router.get("/cds/{cd_id}", response_model=CDResponse)
async def get_cd(
    cd_id: int,
    current_user: CurrentUser,
    _: CollectionOwner = Depends(lambda cd_id=cd_id: verify_collection_owner(cd_id, "cd")),
    db: Session = Depends(get_db)
):
    return cd_service.get(db, id=cd_id)

@router.put("/cds/{cd_id}", response_model=CDResponse)
async def update_cd(
    cd_id: int,
    cd: CDUpdate,
    current_user: CurrentUser,
    _: CollectionOwner = Depends(lambda cd_id=cd_id: verify_collection_owner(cd_id, "cd")),
    db: Session = Depends(get_db)
):
    return cd_service.update(db, id=cd_id, obj_in=cd)

@router.delete("/cds/{cd_id}")
async def delete_cd(
    cd_id: int,
    current_user: CurrentUser,
    _: CollectionOwner = Depends(lambda cd_id=cd_id: verify_collection_owner(cd_id, "cd")),
    db: Session = Depends(get_db)
):
    cd_service.remove(db, id=cd_id)
    return {"message": "CD deleted successfully"}

# Vinyl Record endpoints
@router.post("/libraries/{library_id}/vinyl-records", response_model=VinylRecordResponse)
async def create_vinyl_record(
    library_id: int,
    vinyl_record: VinylRecordCreate,
    current_user: CurrentUser,
    _: LibraryOwner,
    db: Session = Depends(get_db)
):
    return vinyl_record_service.create(db, library_id=library_id, obj_in=vinyl_record)

@router.get("/libraries/{library_id}/vinyl-records", response_model=List[VinylRecordResponse])
async def list_vinyl_records(
    library_id: int,
    current_user: CurrentUser,
    _: LibraryOwner,
    db: Session = Depends(get_db),
    keyword: str = ""
):
    return vinyl_record_service.get_multi(db, library_id=library_id, keyword=keyword)

@router.get("/vinyl-records/{vinyl_record_id}", response_model=VinylRecordResponse)
async def get_vinyl_record(
    vinyl_record_id: int,
    current_user: CurrentUser,
    _: CollectionOwner = Depends(lambda vinyl_record_id=vinyl_record_id: verify_collection_owner(vinyl_record_id, "vinyl")),
    db: Session = Depends(get_db)
):
    return vinyl_record_service.get(db, id=vinyl_record_id)

@router.put("/vinyl-records/{vinyl_record_id}", response_model=VinylRecordResponse)
async def update_vinyl_record(
    vinyl_record_id: int,
    vinyl_record: VinylRecordUpdate,
    current_user: CurrentUser,
    _: CollectionOwner = Depends(lambda vinyl_record_id=vinyl_record_id: verify_collection_owner(vinyl_record_id, "vinyl")),
    db: Session = Depends(get_db)
):
    return vinyl_record_service.update(db, id=vinyl_record_id, obj_in=vinyl_record)

@router.delete("/vinyl-records/{vinyl_record_id}")
async def delete_vinyl_record(
    vinyl_record_id: int,
    current_user: CurrentUser,
    _: CollectionOwner = Depends(lambda vinyl_record_id=vinyl_record_id: verify_collection_owner(vinyl_record_id, "vinyl")),
    db: Session = Depends(get_db)
):
    vinyl_record_service.remove(db, id=vinyl_record_id)
    return {"message": "Vinyl Record deleted successfully"}

# DVD endpoints
@router.post("/libraries/{library_id}/dvds", response_model=DVDResponse)
async def create_dvd(
    library_id: int,
    dvd: DVDCreate,
    current_user: CurrentUser,
    _: LibraryOwner,
    db: Session = Depends(get_db)
):
    return dvd_service.create(db, library_id=library_id, obj_in=dvd)

@router.get("/libraries/{library_id}/dvds", response_model=List[DVDResponse])
async def list_dvds(
    library_id: int,
    current_user: CurrentUser,
    _: LibraryOwner,
    db: Session = Depends(get_db),
    keyword: str = ""
):
    return dvd_service.get_multi(db, library_id=library_id, keyword=keyword)

@router.get("/dvds/{dvd_id}", response_model=DVDResponse)
async def get_dvd(
    dvd_id: int,
    current_user: CurrentUser,
    _: CollectionOwner = Depends(lambda dvd_id=dvd_id: verify_collection_owner(dvd_id, "dvd")),
    db: Session = Depends(get_db)
):
    return dvd_service.get(db, id=dvd_id)

@router.put("/dvds/{dvd_id}", response_model=DVDResponse)
async def update_dvd(
    dvd_id: int,
    dvd: DVDUpdate,
    current_user: CurrentUser,
    _: CollectionOwner = Depends(lambda dvd_id=dvd_id: verify_collection_owner(dvd_id, "dvd")),
    db: Session = Depends(get_db)
):
    return dvd_service.update(db, id=dvd_id, obj_in=dvd)

@router.delete("/dvds/{dvd_id}")
async def delete_dvd(
    dvd_id: int,
    current_user: CurrentUser,
    _: CollectionOwner = Depends(lambda dvd_id=dvd_id: verify_collection_owner(dvd_id, "dvd")),
    db: Session = Depends(get_db)
):
    dvd_service.remove(db, id=dvd_id)
    return {"message": "DVD deleted successfully"}

# Game Cartridge endpoints
@router.post("/libraries/{library_id}/game-cartridges", response_model=GameCartridgeResponse)
async def create_game_cartridge(
    library_id: int,
    game_cartridge: GameCartridgeCreate,
    current_user: CurrentUser,
    _: LibraryOwner,
    db: Session = Depends(get_db)
):
    return game_cartridge_service.create(db, library_id=library_id, obj_in=game_cartridge)

@router.get("/libraries/{library_id}/game-cartridges", response_model=List[GameCartridgeResponse])
async def list_game_cartridges(
    library_id: int,
    current_user: CurrentUser,
    _: LibraryOwner,
    db: Session = Depends(get_db),
    keyword: str = ""
):
    return game_cartridge_service.get_multi(db, library_id=library_id, keyword=keyword)

@router.get("/game-cartridges/{game_cartridge_id}", response_model=GameCartridgeResponse)
async def get_game_cartridge(
    game_cartridge_id: int,
    current_user: CurrentUser,
    _: CollectionOwner = Depends(lambda game_cartridge_id=game_cartridge_id: verify_collection_owner(game_cartridge_id, "game_cartridge")),
    db: Session = Depends(get_db)
):
    return game_cartridge_service.get(db, id=game_cartridge_id)

@router.put("/game-cartridges/{game_cartridge_id}", response_model=GameCartridgeResponse)
async def update_game_cartridge(
    game_cartridge_id: int,
    game_cartridge: GameCartridgeUpdate,
    current_user: CurrentUser,
    _: CollectionOwner = Depends(lambda game_cartridge_id=game_cartridge_id: verify_collection_owner(game_cartridge_id, "game_cartridge")),
    db: Session = Depends(get_db)
):
    return game_cartridge_service.update(db, id=game_cartridge_id, obj_in=game_cartridge)

@router.delete("/game-cartridges/{game_cartridge_id}")
async def delete_game_cartridge(
    game_cartridge_id: int,
    current_user: CurrentUser,
    _: CollectionOwner = Depends(lambda game_cartridge_id=game_cartridge_id: verify_collection_owner(game_cartridge_id, "game_cartridge")),
    db: Session = Depends(get_db)
):
    game_cartridge_service.remove(db, id=game_cartridge_id)
    return {"message": "Game Cartridge deleted successfully"}