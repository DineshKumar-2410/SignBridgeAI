from sqlalchemy import Column, Integer, String, Float, Date, Time, Text, ForeignKey
from sqlalchemy.orm import relationship
from .user import Base

class Conversation(Base):
    __tablename__ = "conversations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(Date)
    time = Column(Time)
    detected_signs = Column(Text)
    speech = Column(Text)
    translation = Column(Text)
    confidence = Column(Float)
    input_language = Column(String(20))
    output_language = Column(String(20))
    
    user = relationship("User", back_populates="conversations")